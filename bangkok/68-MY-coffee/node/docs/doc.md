```mermaid
graph LR
 	Optional --> BeforeExtrinsics
 	BeforeExtrinsics --> Inherents
    Inherents --> OnPoll
    OnPoll --> Extrinsics
 	Extrinsics --> AfterExtrinsics

 subgraph Optional
 	OnRuntimeUpgrade
 end

 subgraph BeforeExtrinsics
 	OnInitialize
 end

 subgraph Inherents
 	direction TB
 	Inherent1
 	Inherent2
    Inherent1 --> Inherent2
end

 subgraph OnPoll
 	OnPoll1
 end

 subgraph Extrinsics
 	direction TB
 	Extrinsic1
 	Extrinsic2
 	Extrinsic1 --> Extrinsic2
 end

 subgraph AfterExtrinsics
 	OnIdle
 	OnFinalize

 	OnIdle --> OnFinalize
 end
 ```
  