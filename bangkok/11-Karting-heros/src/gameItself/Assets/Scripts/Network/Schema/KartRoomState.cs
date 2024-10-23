// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.34
// 

using Colyseus.Schema;
using Action = System.Action;

public partial class KartRoomState : Schema {
	[Type(0, "map", typeof(MapSchema<PlayerState>))]
	public MapSchema<PlayerState> players = new MapSchema<PlayerState>();

	[Type(1, "string")]
	public string status = default(string);

	[Type(2, "number")]
	public float startTime = default(float);

	[Type(3, "number")]
	public float finishedCount = default(float);

	/*
	 * Support for individual property change callbacks below...
	 */

	protected event PropertyChangeHandler<MapSchema<PlayerState>> __playersChange;
	public Action OnPlayersChange(PropertyChangeHandler<MapSchema<PlayerState>> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.players));
		__playersChange += __handler;
		if (__immediate && this.players != null) { __handler(this.players, null); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(players));
			__playersChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __statusChange;
	public Action OnStatusChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.status));
		__statusChange += __handler;
		if (__immediate && this.status != default(string)) { __handler(this.status, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(status));
			__statusChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __startTimeChange;
	public Action OnStartTimeChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.startTime));
		__startTimeChange += __handler;
		if (__immediate && this.startTime != default(float)) { __handler(this.startTime, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(startTime));
			__startTimeChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __finishedCountChange;
	public Action OnFinishedCountChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.finishedCount));
		__finishedCountChange += __handler;
		if (__immediate && this.finishedCount != default(float)) { __handler(this.finishedCount, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(finishedCount));
			__finishedCountChange -= __handler;
		};
	}

	protected override void TriggerFieldChange(DataChange change) {
		switch (change.Field) {
			case nameof(players): __playersChange?.Invoke((MapSchema<PlayerState>) change.Value, (MapSchema<PlayerState>) change.PreviousValue); break;
			case nameof(status): __statusChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(startTime): __startTimeChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(finishedCount): __finishedCountChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			default: break;
		}
	}
}

