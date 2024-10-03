module shoppingcart::shoppingcart {
    use sui::transfer::transfer;
    use sui::tx_context::sender;
    use listings::listings::{Seller, Goods, create_goods, get_goods_name, get_goods_information, get_goods_price, get_good_price};

    // 定义购物车结构体
    public struct Cart has key,store {
        id: UID,
        items: vector<Goods>,
    }

    // 初始化对象
    fun init(ctx: &mut TxContext){
        let cart = Cart {
            id: object::new(ctx),
            items: vector::empty<Goods>(),
        };
        transfer(cart, sender(ctx));
    }

    // 将商品添加到购物车
    public fun create_item(
        index: u64, 
        seller: &mut Seller,
        cart: &mut Cart
    ) {
        // 获得 Goods 的引用
        let new_name = get_goods_name(index, seller);
        let new_information = get_goods_information(index, seller);
        let new_price = get_goods_price(index, seller);

        // 复制 Goods 对象的值
        let new_good = create_goods(new_name, new_information, new_price);
        add_item(cart, new_good);
    }

    // 添加商品到购物车
    public fun add_item(cart: &mut Cart, good: Goods) {
        vector::push_back(&mut cart.items, good);
    }

    // 从购物车删除商品
    public fun remove_item(cart: &mut Cart, index: u64) {
        let length = vector::length(&cart.items);

        if (index < length) {
            vector::swap_remove(&mut cart.items, index);
        }
    }

    // 计算购物车总价
    public fun get_total_price(cart: &Cart): u64 {
        let length = vector::length(&cart.items);
        let mut total_price = 0;
        let mut index = 0;
        while (index < length) {
            let good = vector::borrow(&cart.items, index);
            total_price = total_price + get_good_price(good);
            index = index + 1;
        };
        total_price
    }

}

