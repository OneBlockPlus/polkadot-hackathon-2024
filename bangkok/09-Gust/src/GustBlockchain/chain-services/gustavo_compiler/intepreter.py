import re

class Instruction:
    def __init__(self, kind, *args):
        self.kind = kind
        self.args = args

    def __repr__(self):
        args_str = ', '.join(map(str, self.args))
        return f"Instruction::{self.kind}({args_str})"

class GustavoInterpreter:
    def __init__(self, dsl_code):
        self.dsl_code = dsl_code
        self.instructions = []

    def parse(self):
        """Parse the DSL code to extract meaningful contract instructions."""
        lines = self.dsl_code.splitlines()
        for line in lines:
            line = line.strip()
            if "State" in line and "=" in line:
                self.handle_set_instruction(line)
            elif "State" in line:
                self.handle_get_instruction(line)
            elif "if" in line:
                self.handle_if_instruction(line)
            elif any(op in line for op in ["+", "-", "*", "/"]):
                self.handle_math_instruction(line)

    def handle_set_instruction(self, line):
        """Handles State.variable = value."""
        match = re.match(r"State\.(\w+)\s*=\s*(\w+);", line)
        if match:
            var_name, value = match.groups()
            var_name_bytes = self.to_bytes(var_name)
            value_bytes = self.to_bytes(value)
            self.instructions.append(Instruction("Set", var_name_bytes, value_bytes))

    def handle_get_instruction(self, line):
        """Handles State.variable."""
        match = re.match(r"State\.(\w+);", line)
        if match:
            var_name = match.group(1)
            var_name_bytes = self.to_bytes(var_name)
            self.instructions.append(Instruction("Get", var_name_bytes))

    def handle_if_instruction(self, line):
        """Handles if conditions."""
        match = re.match(r"if\s*(\w+)\s*==\s*(\w+):", line)
        if match:
            var1, var2 = match.groups()
            var1_bytes = self.to_bytes(var1)
            var2_bytes = self.to_bytes(var2)
            self.instructions.append(Instruction("Eq", var1_bytes, var2_bytes, self.to_bytes("result")))

    def handle_math_instruction(self, line):
        """Handles mathematical operations."""
        match = re.match(r"(\w+)\s*=\s*(\w+)\s*([\+\-\*/])\s*(\w+);", line)
        if match:
            result, operand1, operator, operand2 = match.groups()
            op_map = {'+': 'Add', '-': 'Sub', '*': 'Mul', '/': 'Div'}
            op_kind = op_map[operator]
            operand1_bytes = self.to_bytes(operand1)
            operand2_bytes = self.to_bytes(operand2)
            result_bytes = self.to_bytes(result)
            self.instructions.append(Instruction(op_kind, result_bytes, operand1_bytes, operand2_bytes))

    def to_bytes(self, value):
        """Convert a string value to bytes (Vec<u8> in Rust)."""
        return f"Vec<u8>::from({value})"

    def generate_rust_instructions(self):
        """Generates a Rust-style Vec of Instructions."""
        self.parse()
        return self.instructions

# Example Gustavo DSL code
gustavo_code = """
State.currentNumber = 0;
State.accountToNumber = 5;
if currentNumber == 5:
State.currentNumber = currentNumber + 1;
"""

interpreter = GustavoInterpreter(gustavo_code)
instructions = interpreter.generate_rust_instructions()
for instr in instructions:
    print(instr)
