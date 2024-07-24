module Payroll_addr::ERC20TokenV2 {
    use std::signer;
    use aptos_std::vector;
    use aptos_framework::event::{EventHandle, emit_event};
    use aptos_framework::account;
    use aptos_framework::event;


    struct Token {
    name: vector<u8>,
    total_supply: u64,
    symbol: vector<u8>,
    balances: vector<u64>,
    allowances: vector<vector<u64>>,
    owners: vector<address>,
    }

    #[event]
    struct TransferEvent has drop, store {
        from: address,
        to: address,
        value: u64,
    }

    #[event]
    struct ApprovalEvent has drop, store {
        owner: address,
        spender: address,
        value: u64,
    }

    public fun initialize(
        sender: &signer,
        name: vector<u8>,
        total_supply: u64,
        symbol: vector<u8>
    ): Token {
        let sender_address = signer::address_of(sender);
        let owners = vector::empty<address>();
        let balances = vector::empty<u64>();
        let allowances = vector::empty<vector<u64>>();

        vector::push_back(&mut owners, sender_address);
        vector::push_back(&mut balances, total_supply);
        vector::push_back(&mut allowances, vector::empty<u64>());

        Token {
            name,
            total_supply,
            symbol,
            balances,
            allowances,
            owners,
        }
    }

    public fun transfer(token: &mut Token, from: &signer, to: address, value: u64) {
        let sender_address = signer::address_of(from);
        let sender_index = find_owner_index(&token.owners, sender_address);
        let receiver_index = find_owner_index(&token.owners, to);

        // Ensure sender has enough balance
        let sender_balance = vector::borrow(&token.balances, sender_index);
        assert!(*sender_balance >= value, 1);

        // Update balances
         let sender_balance_mut = vector::borrow_mut(&mut token.balances, sender_index);
        *sender_balance_mut = *sender_balance_mut - value;

        if (receiver_index >= 0) {
            let receiver_balance_mut = vector::borrow_mut(&mut token.balances, receiver_index);
            *receiver_balance_mut = *receiver_balance_mut + value;
        } else {
            vector::push_back(&mut token.owners, to);
            vector::push_back(&mut token.balances, value);
            vector::push_back(&mut token.allowances, vector::empty<u64>());
        };

        // Emit Transfer event
        event::emit<TransferEvent>(
            TransferEvent {
                from: sender_address,
                to, 
                value,
            },
        );
    }

    public fun approve(token: &mut Token, owner: &signer, spender: address, value: u64) {
        let owner_address = signer::address_of(owner);
        let owner_index = find_owner_index(&token.owners, owner_address);
        let spender_index = find_owner_index(&token.owners, spender);

        if (spender_index < 0) {
            vector::push_back(&mut token.owners, spender);
            vector::push_back(&mut token.balances, 0);
            vector::push_back(&mut token.allowances, vector::empty<u64>());
        };

        // Re-find the spender index as it might have been added above
        let spender_index = find_owner_index(&token.owners, spender);

        // Borrow a reference to the owner's allowances vector
        let owner_allowances = vector::borrow_mut(&mut token.allowances, owner_index);
        // Check if we need to add a new allowance or update an existing one
        if (vector::length(owner_allowances) <= spender_index) {
            vector::push_back(owner_allowances, value);
        } else {
            let spender_allowance = vector::borrow_mut(owner_allowances, spender_index);
            *spender_allowance = value;
        };

        // Emit Approval event
        event::emit<ApprovalEvent>(
            ApprovalEvent {
                owner: owner_address,
                spender, 
                value,
            },
        );
    }

    public fun find_owner_index(owners: &vector<address>, owner: address): u64 {
        let length = vector::length(owners);
        let i = 0;
        while (i < length) {
            if (*vector::borrow(owners, i) == owner) {
                return i ;
            };
            i = i+1;
        };
        abort 1
    }
}
