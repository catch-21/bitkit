export const BITKIT_WALLET_SEED_HASH_PREFIX = Buffer.from(
	'@Bitkit/wallet-uuid',
);

//How many addresses to generate when more are needed.
export const GENERATE_ADDRESS_AMOUNT = 5;

// TODO: Add this as a settings for users to adjust when needed.
export const GAP_LIMIT = 20;

// TODO: remove chunk logic and move it to rn-electrum library
export const CHUNK_LIMIT = 15;

export const TRANSACTION_DEFAULTS = {
	recommendedBaseFee: 256, // Total recommended tx base fee in sats
	dustLimit: 546, // Minimum value in sats for an output. Outputs below the dust limit may not be processed because the fees required to include them in a block would be greater than the value of the transaction itself.
};

// Default spending percentage for the transfer slider (of onchain balance)
export const DEFAULT_SPENDING_PERCENTAGE = 0.2;

// How much of the users funds we allow to be used for Lightning (of onchain balance)
export const MAX_SPENDING_PERCENTAGE = 0.8;

// Used to make sure LSP balance is bigger than client balance
export const LIGHTNING_DIFF = 0.01;

export const DEFAULT_CHANNEL_DURATION = 6;

// Because BT /info minChannelSizeSat constantly changes depending on network fees,
// we use a multiplier to calculate the minimum channel size.
export const BT_MIN_CHANNEL_SIZE_SAT_MULTIPLIER = 0.1;
