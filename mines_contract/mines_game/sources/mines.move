module mines_game::mines {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::object::{Self, UID};

    /// Error: Không đủ số dư trong Treasury để trả thưởng
    const EInsufficientBalance: u64 = 1;

    /// Object lưu trữ thông tin và số dư của Game (Treasury)
    struct GameTreasury has key {
        id: UID,
        balance: Balance<SUI>,
    }

    /// Event khi đặt cược
    struct BetPlaced has copy, drop {
        player: address,
        amount: u64,
        // Có thể thêm các field khác nếu cần
    }

    /// Event khi nhận thưởng
    struct RewardClaimed has copy, drop {
        player: address,
        amount: u64,
    }

    /// Hàm khởi tạo (chạy 1 lần khi publish package)
    fun init(ctx: &mut TxContext) {
        let treasury = GameTreasury {
            id: object::new(ctx),
            balance: balance::zero(),
        };
        // Share object để mọi người có thể tương tác
        transfer::share_object(treasury);
    }

    /// Hàm nạp thêm tiền vào Treasury (dành cho Admin nạp vốn)
    public fun deposit(treasury: &mut GameTreasury, coin: Coin<SUI>, _ctx: &mut TxContext) {
        let balance = coin::into_balance(coin);
        balance::join(&mut treasury.balance, balance);
    }

    /// 1. Hàm Place Bet: Người chơi gửi tiền vào
    public fun place_bet(treasury: &mut GameTreasury, bet: Coin<SUI>, ctx: &mut TxContext) {
        let amount = coin::value(&bet);
        let balance = coin::into_balance(bet);

        // Cộng tiền cược vào Treasury
        balance::join(&mut treasury.balance, balance);

        event::emit(BetPlaced {
            player: tx_context::sender(ctx),
            amount,
        });
    }

    /// 2. Hàm Claim Reward: Trả thưởng cho người chơi
    public fun claim_reward(treasury: &mut GameTreasury, amount: u64, ctx: &mut TxContext) {
        // Kiểm tra số dư Treasury
        assert!(balance::value(&treasury.balance) >= amount, EInsufficientBalance);

        // Lấy tiền từ Treasury trả cho user
        let reward = coin::take(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(reward, tx_context::sender(ctx));

        event::emit(RewardClaimed {
            player: tx_context::sender(ctx),
            amount,
        });
    }

    /// 3. Hàm Withdraw: Rút hết tiền trong Treasury về ví chỉ định (Admin)
    public fun withdraw(treasury: &mut GameTreasury, recipient: address, ctx: &mut TxContext) {
        let amount = balance::value(&treasury.balance);
        let coin = coin::take(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }
}
