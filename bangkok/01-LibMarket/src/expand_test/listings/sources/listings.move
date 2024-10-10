module listings::listings {
    use std::ascii;
    use sui::transfer::transfer;
    use sui::tx_context::sender;

    // 商品结构体
    public struct Goods has store, drop{
        name: ascii::String,
        information: ascii::String,
        price: u64,
    }

    // 卖家的商品列表
    public struct Seller has key, store {
        id: UID,
        goods_list: vector<Goods>,
    }

    // 创建卖家
    fun init(ctx: &mut TxContext) {
        let seller = Seller {
            id: object::new(ctx), 
            goods_list: vector::empty<Goods>(),
        };
        transfer(seller, sender(ctx));
    }

    // 创建商品
    public fun create_goods(
        name: ascii::String, 
        information: ascii::String, 
        price: u64, 
    ): Goods {
        Goods {
            name,
            information,
            price,
        }
    }

    // 将商品添加到卖家列表
    public fun add_goods(
        seller: &mut Seller, 
        name: ascii::String, 
        information: ascii::String, 
        price: u64,
    ) {
        let goods = create_goods(name, information, price);
        vector::push_back(&mut seller.goods_list, goods)
    }

    public fun get_goods_name(
        index: u64,
        seller: &mut Seller
    ): ascii::String {
        let good = vector::borrow_mut(&mut seller.goods_list, index);
        good.name
    }

    public fun get_goods_information(
        index: u64,
        seller: &mut Seller
    ): ascii::String {
        let good = vector::borrow_mut(&mut seller.goods_list, index);
        good.information
    }

    public fun get_goods_price(
        index: u64,
        seller: &mut Seller
    ): u64 {
        let good = vector::borrow_mut(&mut seller.goods_list, index);
        good.price
    }
    // 通过对象获得价格
    public fun get_good_price(good: &Goods): u64 {
        good.price
    }
    
    // 修改向量中指定索引的商品对象
    public fun update_goods(
        seller: &mut Seller,
        index: u64,
        new_name: ascii::String,
        new_information: ascii::String,
        new_price: u64
    ) {
        let good = vector::borrow_mut(&mut seller.goods_list, index);

        // 修改 Goods 对象的字段
        good.name = new_name;
        good.information = new_information;
        good.price = new_price;
    }

    // 查看商品详情
    public fun get_goods_details(
        seller: &mut Seller, 
        index: u64
    ): (ascii::String, ascii::String, u64) {
        let good = vector::borrow_mut(&mut seller.goods_list, index);
        (good.name, good.information, good.price)
    }

    // 下架商品
    public fun destroy_goods(seller: &mut Seller, index: u64) {
        vector::remove(&mut seller.goods_list, index);
    }


}


