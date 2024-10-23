/**
Author: astro
Email: astromanrx at gmail.com
Naming convention follows this book recommended coding style https://unity.com/resources/create-code-c-sharp-style-guide-e-book
*/

using Cinemachine;
using KartGame.KartSystems;
using UnityEngine;
using VContainer;
using VContainer.Unity;

public class HeroFactory{
        private IObjectResolver _container;
        private GameSettings _gameSettings;
        private CinemachineVirtualCamera _camera;
        public HeroFactory(IObjectResolver container,GameSettings gameSettings,CinemachineVirtualCamera camera){
            _container = container;
            _gameSettings = gameSettings;
            _camera = camera;
        }

        public Hero Create(bool isPlayer,Vector3 position,Quaternion rotation)
        {
            GameObject hero;
            GameObject car;

            hero =  _container.Instantiate(_gameSettings.HeroPrefab);
            _container.Inject(hero);
            
            if(isPlayer){
                car = _container.Instantiate(_gameSettings.CarPrefabs[0],position,rotation);
                _camera.gameObject.SetActive(true);
                _camera.Follow = car.transform;
                _camera.LookAt = car.transform.GetChild(0);
            }else{
                car = _container.Instantiate(_gameSettings.NetworkCarPrefabs[0],position,rotation);               
            }            

            
            var look = hero.GetComponent<HeroLook>();
            
            return new Hero(car.transform,hero.transform,look);
        }
    }