#!/bin/bash
VERSION=$(jq -r .version package.json)
ID="undefined_publisher.ladnik-column-aligner" # или из package.json: jq -r .publisher.name + '.' + .name
rm -f ladnik-column-aligner*.vsix
code --uninstall-extension $ID --force && npm run build && code --install-extension "/Users/michaelpopov/Documents/GitHub/TypeScript/Ladnik-Column-Aligner-for-Text-and-Code/ladnik-column-aligner-${VERSION}.vsix"
