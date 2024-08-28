const QueryCollectionMetadata = async (_collectionId, api) => {
    try {
      let _api = api;
      let query = await _api.query.nfts.collectionMetadataOf(_collectionId)
      console.log(query);
    //   return query
      if (query.isSome) {
        
        const collection = query.unwrap();

        const collectionHuman = collection.toHuman()

        return collectionHuman;

        // console.log("Collection data:", collection.toHuman());

        // Si sabes la estructura del tipo de datos, accede a campos específicos
        // Ejemplo (dependiendo de la estructura real):
        // console.log("Collection Name:", collection.name.toString());
        // console.log("Collection Items:", collection.items.toString());
      } else {
        console.log("Collection not found.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  export default QueryCollectionMetadata;