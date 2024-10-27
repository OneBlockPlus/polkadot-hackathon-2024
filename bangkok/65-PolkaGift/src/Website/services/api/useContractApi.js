import {fetchMoonEventData,getAllNftsMoonEventId,BidNftMoon,useContract,GetHighestBidMoon} from './moonbeam/useContractApi';
import {fetchPolkaEventData,getNftsPolkaEventID,useContract as useContractPolka,GetHighestBidPolka} from './polkadot/useContractApi';


export async function GetAllEvents(){
    let arr = [];
    let _marr = await fetchMoonEventData();
    let _parr = await fetchPolkaEventData();
    arr = arr.concat(_marr)
    arr = arr.concat(_parr)
    return arr;

}

export async function GetAllNftsEventID(id ){
    let arr = [];
    let _marr = await getAllNftsMoonEventId(id);
    let _parr = await getNftsPolkaEventID(id);
    arr = arr.concat(_marr)
    arr = arr.concat(_parr)
    return arr;
}

export async function BidNFT(tokenId,price,privateKey=null,Mnemonic=null){
    privateKey = Mnemonic != null ? "":privateKey;
    Mnemonic = privateKey != null ? "":Mnemonic;

    let moonUseContract = await useContract(privateKey);
    let polkaUseContract = await useContractPolka(Mnemonic);

    let highestPrice=  await GetHighestPrice(tokenId,moonUseContract,polkaUseContract.contract,polkaUseContract.api,polkaUseContract.signerAddress)

    if (privateKey != null){
       return await BidNftMoon(moonUseContract,tokenId,privateKey,highestPrice,price)
    }else if (Mnemonic != null){
    }


}

export async function GetHighestPrice(id,contract = null,contractPolka = null,api=null,signerAddress=null) {
    let _marr = await GetHighestBidMoon(contract,id);
    let _parr = await GetHighestBidPolka(api,signerAddress,contractPolka,id);
    if (_marr != -1 && _marr > _parr) return _marr;
    if (_parr != -1 && _marr < _parr) return _parr;
    return price;
}