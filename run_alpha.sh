# Create a new default wallet if it doesn't exist
if ! "$install_path/bin/whive-cli" listwallets | grep -q 'default_wallet'; then
    log "Creating default wallet..."
    "$install_path/bin/whive-cli" createwallet "default_wallet"
fi

# Load the default wallet
log "Loading default wallet..."
"$install_path/bin/whive-cli" loadwallet "default_wallet"

# Generate new address for miner
log "Getting new Whive address for mining"
NEWADDRESS=$("$install_path/bin/whive-cli" getnewaddress)
log "Your new Whive address: $NEWADDRESS"
echo "Your new Whive address: $NEWADDRESS"
