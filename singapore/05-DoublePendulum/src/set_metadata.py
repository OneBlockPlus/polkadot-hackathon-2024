
from substrateinterface import SubstrateInterface, Keypair
import os

wsendpoint = os.getenv("WSENDPOINT")
collectionid = os.getenv("COLLECTIONID")


def set_metadata(item_id, cid):
    """
    setting metadata in python substrate interface, so it can be signed secretly with .env
    :param item_id: is id of an NFT we are setting metadata to
    :param cid: cid of metadata json
    :return:
    """
    substrate = SubstrateInterface(url=wsendpoint)

    keypair = Keypair.create_from_uri(os.getenv("METADATASECRETKEY"))

    call = substrate.compose_call(call_module="Nfts", call_function="set_metadata", call_params={
        "collection": int(collectionid),
        "item": int(item_id),
        "data": cid
    })

    extrinsic = substrate.create_signed_extrinsic(call=call, keypair=keypair, era={'period': 64})

    try:
        receipt = substrate.submit_extrinsic(extrinsic)
    except:
        print("failed :(")
