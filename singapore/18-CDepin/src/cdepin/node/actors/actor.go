package actors

import "github.com/asynkron/protoactor-go/actor"

const (
	CACHE_ACTOR    = "cache_actor"
	P2P_TS_ACTOR   = "p2p_ts_actor"
	RESOURCE_ACTOR = "resource_actor"
)

var globalActorSystem *ActorSystem

type ActorSystem struct {
	*actor.ActorSystem
	Actors map[string]*actor.PID
}

func GetGlobalActorSystem() *ActorSystem {
	if globalActorSystem == nil {
		globalActorSystem = NewActorSystem(actor.NewActorSystem())
	}
	return globalActorSystem
}

func InitGlobalActorSystem(actorSys *actor.ActorSystem) {
	globalActorSystem = NewActorSystem(actorSys)
}

func NewActorSystem(actorSys *actor.ActorSystem) *ActorSystem {
	return &ActorSystem{
		ActorSystem: actorSys,
		Actors:      make(map[string]*actor.PID),
	}
}

func (as *ActorSystem) RegisterActor(name string, pid *actor.PID) {
	if pid == nil {
		return
	}
	as.Actors[name] = pid
}

func (as *ActorSystem) GetActor(name string) *actor.PID {
	return as.Actors[name]
}
