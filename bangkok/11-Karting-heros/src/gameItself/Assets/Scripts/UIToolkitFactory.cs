/**
Author: astro
Email: astromanrx at gmail.com
Naming convention follows this book recommended coding style https://unity.com/resources/create-code-c-sharp-style-guide-e-book
*/

using KartGame.KartSystems;
using UnityEngine;
using UnityEngine.UIElements;
using VContainer;
using VContainer.Unity;

public class UIToolkitFactory{
        private IObjectResolver _container;
                
        public UIToolkitFactory(IObjectResolver container){
            _container = container;            
        }

        public UIDocument Create(GameObject uiPrefab)
        {        
            var uiGameObject =  _container.Instantiate(uiPrefab);
            _container.Inject(uiGameObject);
            
            return uiGameObject.GetComponent<UIDocument>();            
        }
    }