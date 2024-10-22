import { ethers } from 'hardhat';
import verify from './verify';

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from ${deployer.address}`);

    const Shop = await ethers.getContractFactory('Shop');
    const shop = await Shop.deploy();
    await shop.deploymentTransaction()?.wait(5);
    const shopAddress = await shop.getAddress();
    console.log(`Deployed Shop at ${shopAddress}`);
    await verify(shopAddress, []);

    const Products = await ethers.getContractFactory('Products');
    const products = await Products.deploy('base uri');
    await products.deploymentTransaction()?.wait(5);
    const productsAddress = await products.getAddress();
    console.log(`Deployed Products at ${productsAddress}`);
    await verify(productsAddress, ['base uri']);

    const Warehouse = await ethers.getContractFactory('Warehouse');
    const warehouse = await Warehouse.deploy(shopAddress, productsAddress);
    await warehouse.deploymentTransaction()?.wait(5);
    const warehouseAddress = await warehouse.getAddress();
    console.log(`Deployed Warehouse at ${warehouseAddress}`);
    await verify(warehouseAddress, [shopAddress, productsAddress]);

    await shop.setWarehouse(warehouseAddress);
    await products.setWarehouse(warehouseAddress);
    console.log('Set Warehouse address into Shop and Products');

    const Picking = await ethers.getContractFactory('PickingRobot');
    const picking = await Picking.deploy(warehouseAddress);
    await picking.deploymentTransaction()?.wait(5);
    console.log(`Deployed Picking Robot at ${await picking.getAddress()}`);
    await verify(await picking.getAddress(), [warehouseAddress]);

    const Packing = await ethers.getContractFactory('PackingRobot');
    const packing = await Packing.deploy(warehouseAddress);
    await packing.deploymentTransaction()?.wait(5);
    console.log(`Deployed Packing Robot at ${await packing.getAddress()}`);
    await verify(await packing.getAddress(), [warehouseAddress]);

    const Delivery = await ethers.getContractFactory('DeliveryRobot');
    const delivery = await Delivery.deploy(warehouseAddress);
    await delivery.deploymentTransaction()?.wait(5);
    console.log(`Deployed Delivery Robot at ${await delivery.getAddress()}`);
    await verify(await delivery.getAddress(), [warehouseAddress]);

    await warehouse.setRobot(await picking.getAddress());
    await warehouse.setRobot(await packing.getAddress());
    await warehouse.setRobot(await delivery.getAddress());
    console.log('Added Robots addresses into Warehouse');
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
