/**
Author: astro
Email: astromanrx at gmail.com
Naming convention follows this book recommended coding style https://unity.com/resources/create-code-c-sharp-style-guide-e-book
*/

using System;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UnityEngine;
using VitalRouter;
using System.Linq;

public class DummyNetworkManager 
{    
    
    private ICommandPublisher _commandPublisher;
    private IBlockchainManager _blockchainManager;
   
    public DummyNetworkManager(ICommandPublisher commandPublisher,IBlockchainManager blockchainManager){
        _commandPublisher = commandPublisher;
        _blockchainManager = blockchainManager;        

        Debug.Log($"Wallet address: {blockchainManager.Address}");
    }    

    public async UniTask FindRace(){
       
    }

    public void ReportFinished(){
        
    }

    public void ReportReady(){
        
    }

    public void ReportMapLoaded(){
        
    }

    public void Sync(Transform transform){
        
    }
}
