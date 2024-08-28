import re
import sys

def add_parallel_functionality(method_name: str, var: str):
    # Check if there is a "+" functionality in the code
    if method_name != "":
        # Create the new methods to be inserted
        method1 = f"""
function {method_name}() public {{
    ICrossChainBridge crossChainBridge = ICrossChainBridge(crossChainBridgeAddress);
    crossChainBridge.readValues(
        address(this),
        contractAddresses,
        rpcUrls,
        "{var}",
        "{method_name}1"
    );
}}
"""
        method2 = f"""
function {method_name}1(
    uint256[] calldata {var}s,
    uint32[] calldata {var}Versions
) public {{
    require({var}s.length == {var}Versions.length, "Arrays must be of the same length");

    uint256 maxIndex = 0;
    uint256 current{var} = {var}s[maxIndex];
    uint32 current{var}Version = {var}Versions[maxIndex];
    for (uint256 i = 1; i < {var}Versions.length; i++) {{
        if ({var}Versions[i] > {var}Versions[maxIndex]) {{
            maxIndex = i;
            current{var} = {var}s[maxIndex];
            current{var}Version = {var}Versions[maxIndex];
        }}
    }}
    if ({var}Version > {var}Versions[maxIndex]) {{
        current{var} = {var};
        current{var}Version = {var}Version;
    }}

    count = currentcount + 1;
    countVersion = currentcountVersion + 1;
}}
"""

        # Insert the new methods at the end of the code
    code = "\n" + method1 + "\n" + method2

    return code

def add_func_to_read_var(var_name: str):
    # Define the dynamic block of code with placeholders
    dynamic_code_block = f"""
    function getCurrent{var_name}() public {{
        ICrossChainBridge crossChainBridge = ICrossChainBridge(crossChainBridgeAddress);
        crossChainBridge.readValues(
            address(this),
            contractAddresses,
            rpcUrls,
            "{var_name}",
            "getCurrent{var_name}1"
        );
    }}

    event Get{var_name}(uint256 {var_name});

    function getCurrent{var_name}1(
        uint256[] calldata {var_name}s,
        uint32[] calldata {var_name}Versions
    ) public {{
        require({var_name}s.length == {var_name}Versions.length, "Arrays must be of the same length");

        uint256 maxIndex = 0;
        uint256 current{var_name} = {var_name}s[maxIndex];
        uint32 current{var_name}Version = {var_name}Versions[maxIndex];
        for (uint256 i = 1; i < {var_name}Versions.length; i++) {{
            if ({var_name}Versions[i] > {var_name}Versions[maxIndex]) {{
                maxIndex = i;
                current{var_name} = {var_name}s[maxIndex];
                current{var_name}Version = {var_name}Versions[maxIndex];
            }}
        }}
        if ({var_name}Version > {var_name}Versions[maxIndex]) {{
            current{var_name} = {var_name};
            current{var_name}Version = {var_name}Version;
        }}

        emit Get{var_name}(current{var_name});
    }}
    """

    # Define a pattern to find the contract definition
    # pattern = r'contract\s+(\w+)\s*{'

    # # Find all matches for the contract definitions
    # matches = re.findall(pattern, solidity_code)

    # # If no contract definitions are found, return the original code
    # if not matches:
    #     return solidity_code

    # # Insert the dynamic code block after the first contract definition
    # new_code = re.sub(r'(contract\s+\w+\s*{)', r'\1' + dynamic_code_block, solidity_code, 1, re.DOTALL)

    return dynamic_code_block

def add_new_parallel_contract_func(solidity_code: str, var_name: str):
    # Define the function to be added
    function_code = """
    function addNewParallelContract(address contractAddress, string memory rpcUrl) public {
        contractAddresses.push(contractAddress);
        rpcUrls.push(rpcUrl);
    }
    """ + add_parallel_functionality("increment", var_name)
    
    # Define a pattern to find the contract definition
    pattern = r'contract\s+(\w+)\s*{'
    
    # Find all matches for the contract definitions
    matches = re.findall(pattern, solidity_code)
    
    # If no contract definitions are found, return the original code
    if not matches:
        return solidity_code
    
    # Find the position to insert the new function
    new_code = re.sub(r'(contract\s+\w+\s*{)', r'\1' + function_code, solidity_code, 1, re.DOTALL)

    return new_code

def add_initialization_to_constructor(solidity_code):
    # Define the regex pattern to match uint256 public variables with their indentation
    variable_pattern = re.compile(r"(\s*)(uint256\s+public\s+(\w+);)")
    
    # Find all matches to get the variable names
    variable_names = [match.group(3) for match in variable_pattern.finditer(solidity_code)]
    
    # Create initialization code for each variable
    initialization_lines = []
    for variable_name in variable_names:
        initialization_lines.append(f"{variable_name} = 0;")
        initialization_lines.append(f"        {variable_name}Version = 0;")
    
    # Add initialization line for crossChainBridgeAddress
    initialization_lines.append("        crossChainBridgeAddress = _crossChainBridgeAddress;")
    
    # Combine initialization lines into a block
    initialization_block = "\n".join(initialization_lines)
    
    # Define the regex pattern to match the constructor
    constructor_pattern = re.compile(r"(constructor\s*\(.*?\)\s*{)")
    
    def add_initialization_to_existing(match):
        constructor_signature = match.group(1)
        # Add the initialization block inside the constructor
        return f"{constructor_signature}\n        {initialization_block}\n    "

    # Check if constructor exists
    if constructor_pattern.search(solidity_code):
        # Add initialization block to the existing constructor
        updated_code = constructor_pattern.sub(add_initialization_to_existing, solidity_code)
    else:
        # Insert a new constructor with initialization code before the first function
        constructor_template = f"""
    constructor(address _crossChainBridgeAddress) {{
        {initialization_block}
    }}
"""
        # Add the new constructor before the first function or at the end if no function is present
        updated_code = re.sub(r"(contract\s+\w+\s*{)", r"\1" + constructor_template, solidity_code)
    
    return add_new_parallel_contract_func(updated_code, variable_names[0])

def add_version_variables(solidity_code):
    # Define the regex pattern to match uint256 public variables and their indentation
    pattern = re.compile(r"(\s*uint256\s+public\s+(\w+);)")
    
    def add_versions(match):
        indentation = match.group(1)
        variable_name = match.group(2)
        # Add the version variable with the same indentation
        return f"{match.group(0)}\n    uint32 public {variable_name}Version;\n" + add_func_to_read_var(variable_name)

    # Replace each match with the original line plus the new version line
    updated_code = pattern.sub(add_versions, solidity_code)
    return add_initialization_to_constructor(updated_code)

def remove_excess(code: str, function_name: str) -> str:
    # Regular expression to find the function and remove it
    pattern = rf"function\s+{function_name}\s*\([^\)]*\)\s*public\s*[^\{{]*\{{[^\}}]*\}}"
    modified_code = re.sub(pattern, "", code, flags=re.DOTALL)
    
    return modified_code.strip()

def parse_code(solidity_code):
    # Define the lines to be added
    lines_to_add = """
    address public crossChainBridgeAddress;

    address[] public contractAddresses;
    string[] public rpcUrls;
    """
    
    # Regex pattern to find the end of the contract declaration
    pattern = r"(contract\s+\w+\s*{)"
    
    # Find the match
    match = re.search(pattern, solidity_code)
    if match:
        # Add lines after the contract declaration
        updated_code = re.sub(pattern, r"\1" + lines_to_add, solidity_code)
        updated_code = remove_excess(updated_code, "increment")
        return add_version_variables(updated_code)
    else:
        raise ValueError("Contract declaration not found in the provided Solidity code")

# Example Solidity code
solidity_code = """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 public count;

    // Increment the counter
    function increment() public {
        count += 1;
    }
}

"""

def add_icrosschainbridge_interface(solidity_code):
    interface_code = """
interface ICrossChainBridge {
    function readValues(
        address currentContractAddress,
        address[] calldata contractAddresses,
        string[] calldata rpcUrls,
        string calldata variableName,
        string calldata functionName
    ) external;
}
"""
    # Insert the interface code after the pragma statement
    updated_code = re.sub(r'(pragma solidity .+;)', r'\1\n' + interface_code, solidity_code)
    return updated_code

def save_parsed_code_to_file(filename: str, code: str):
    with open(filename, "w") as file:
        file.write(code)

# Add lines to the Solidity code
def main():
    # Ask for the file name
    input_file_name = input("Enter the Solidity file name: ")
    
    # Read the Solidity code from the file
    with open(input_file_name, "r") as file:
        solidity_code = file.read()
    
    # Process the Solidity code
    updated_code = add_icrosschainbridge_interface(parse_code(solidity_code))
    
    # Create the output file name
    output_file_name = f"parsed_{input_file_name}"
    
    # Save the updated code to the new file
    save_parsed_code_to_file(output_file_name, updated_code)
    print(f"Parsed code saved to {output_file_name}")

if __name__ == "__main__":
    main()