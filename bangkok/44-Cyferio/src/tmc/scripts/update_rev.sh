#!/bin/bash

# Check if the new revision was passed as an argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <new-revision>"
    exit 1
fi

NEW_REV="$1"


# Function to update the revision in a given file
update_revision() {
    local file=$1

    if [ -f "$file" ]; then
        # Use sed to find and replace the revision in the specified git URL line
        sed -i "" -E "s#(git = \"ssh://git@github.com/cyferio-labs/sovereign-sdk[^\"]*\", rev = \")[^\"]*(\")#\1$NEW_REV\2#g" "$file"

        if [ $? -eq 0 ]; then
            echo "Updated $file successfully."
        else
            echo "Failed to update $file."
        fi
    else
        echo "$file does not exist."
    fi
}


# Define the list of files to update
FILES=(
    "Cargo.toml"
    "crates/provers/risc0/guest-celestia/Cargo.toml"
    "crates/provers/risc0/guest-mock/Cargo.toml"
)

# Loop over the list and update each file
for file in "${FILES[@]}"; do
    update_revision "$file"
done