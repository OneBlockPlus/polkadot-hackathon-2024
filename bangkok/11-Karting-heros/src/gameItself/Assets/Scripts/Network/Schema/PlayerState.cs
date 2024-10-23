// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.34
// 

using Colyseus.Schema;
using Action = System.Action;

public partial class PlayerState : Schema {
	[Type(0, "number")]
	public float x = default(float);

	[Type(1, "number")]
	public float y = default(float);

	[Type(2, "number")]
	public float z = default(float);

	[Type(3, "number")]
	public float rotX = default(float);

	[Type(4, "number")]
	public float rotY = default(float);

	[Type(5, "number")]
	public float rotZ = default(float);

	[Type(6, "number")]
	public float rotW = default(float);

	[Type(7, "string")]
	public string name = default(string);

	[Type(8, "string")]
	public string hat = default(string);

	[Type(9, "string")]
	public string hair = default(string);

	[Type(10, "string")]
	public string dress = default(string);

	[Type(11, "string")]
	public string gloves = default(string);

	[Type(12, "string")]
	public string pants = default(string);

	[Type(13, "string")]
	public string shoes = default(string);

	[Type(14, "boolean")]
	public bool ready = default(bool);

	[Type(15, "boolean")]
	public bool isMapLoaded = default(bool);

	[Type(16, "boolean")]
	public bool finished = default(bool);

	[Type(17, "number")]
	public float finishTime = default(float);

	[Type(18, "number")]
	public float score = default(float);

	[Type(19, "string")]
	public string address = default(string);

	/*
	 * Support for individual property change callbacks below...
	 */

	protected event PropertyChangeHandler<float> __xChange;
	public Action OnXChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.x));
		__xChange += __handler;
		if (__immediate && this.x != default(float)) { __handler(this.x, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(x));
			__xChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __yChange;
	public Action OnYChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.y));
		__yChange += __handler;
		if (__immediate && this.y != default(float)) { __handler(this.y, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(y));
			__yChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __zChange;
	public Action OnZChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.z));
		__zChange += __handler;
		if (__immediate && this.z != default(float)) { __handler(this.z, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(z));
			__zChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __rotXChange;
	public Action OnRotXChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.rotX));
		__rotXChange += __handler;
		if (__immediate && this.rotX != default(float)) { __handler(this.rotX, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(rotX));
			__rotXChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __rotYChange;
	public Action OnRotYChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.rotY));
		__rotYChange += __handler;
		if (__immediate && this.rotY != default(float)) { __handler(this.rotY, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(rotY));
			__rotYChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __rotZChange;
	public Action OnRotZChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.rotZ));
		__rotZChange += __handler;
		if (__immediate && this.rotZ != default(float)) { __handler(this.rotZ, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(rotZ));
			__rotZChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __rotWChange;
	public Action OnRotWChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.rotW));
		__rotWChange += __handler;
		if (__immediate && this.rotW != default(float)) { __handler(this.rotW, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(rotW));
			__rotWChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __nameChange;
	public Action OnNameChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.name));
		__nameChange += __handler;
		if (__immediate && this.name != default(string)) { __handler(this.name, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(name));
			__nameChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __hatChange;
	public Action OnHatChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.hat));
		__hatChange += __handler;
		if (__immediate && this.hat != default(string)) { __handler(this.hat, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(hat));
			__hatChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __hairChange;
	public Action OnHairChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.hair));
		__hairChange += __handler;
		if (__immediate && this.hair != default(string)) { __handler(this.hair, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(hair));
			__hairChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __dressChange;
	public Action OnDressChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.dress));
		__dressChange += __handler;
		if (__immediate && this.dress != default(string)) { __handler(this.dress, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(dress));
			__dressChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __glovesChange;
	public Action OnGlovesChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.gloves));
		__glovesChange += __handler;
		if (__immediate && this.gloves != default(string)) { __handler(this.gloves, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(gloves));
			__glovesChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __pantsChange;
	public Action OnPantsChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.pants));
		__pantsChange += __handler;
		if (__immediate && this.pants != default(string)) { __handler(this.pants, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(pants));
			__pantsChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __shoesChange;
	public Action OnShoesChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.shoes));
		__shoesChange += __handler;
		if (__immediate && this.shoes != default(string)) { __handler(this.shoes, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(shoes));
			__shoesChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<bool> __readyChange;
	public Action OnReadyChange(PropertyChangeHandler<bool> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.ready));
		__readyChange += __handler;
		if (__immediate && this.ready != default(bool)) { __handler(this.ready, default(bool)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(ready));
			__readyChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<bool> __isMapLoadedChange;
	public Action OnIsMapLoadedChange(PropertyChangeHandler<bool> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.isMapLoaded));
		__isMapLoadedChange += __handler;
		if (__immediate && this.isMapLoaded != default(bool)) { __handler(this.isMapLoaded, default(bool)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(isMapLoaded));
			__isMapLoadedChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<bool> __finishedChange;
	public Action OnFinishedChange(PropertyChangeHandler<bool> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.finished));
		__finishedChange += __handler;
		if (__immediate && this.finished != default(bool)) { __handler(this.finished, default(bool)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(finished));
			__finishedChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __finishTimeChange;
	public Action OnFinishTimeChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.finishTime));
		__finishTimeChange += __handler;
		if (__immediate && this.finishTime != default(float)) { __handler(this.finishTime, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(finishTime));
			__finishTimeChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<float> __scoreChange;
	public Action OnScoreChange(PropertyChangeHandler<float> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.score));
		__scoreChange += __handler;
		if (__immediate && this.score != default(float)) { __handler(this.score, default(float)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(score));
			__scoreChange -= __handler;
		};
	}

	protected event PropertyChangeHandler<string> __addressChange;
	public Action OnAddressChange(PropertyChangeHandler<string> __handler, bool __immediate = true) {
		if (__callbacks == null) { __callbacks = new SchemaCallbacks(); }
		__callbacks.AddPropertyCallback(nameof(this.address));
		__addressChange += __handler;
		if (__immediate && this.address != default(string)) { __handler(this.address, default(string)); }
		return () => {
			__callbacks.RemovePropertyCallback(nameof(address));
			__addressChange -= __handler;
		};
	}

	protected override void TriggerFieldChange(DataChange change) {
		switch (change.Field) {
			case nameof(x): __xChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(y): __yChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(z): __zChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(rotX): __rotXChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(rotY): __rotYChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(rotZ): __rotZChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(rotW): __rotWChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(name): __nameChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(hat): __hatChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(hair): __hairChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(dress): __dressChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(gloves): __glovesChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(pants): __pantsChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(shoes): __shoesChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			case nameof(ready): __readyChange?.Invoke((bool) change.Value, (bool) change.PreviousValue); break;
			case nameof(isMapLoaded): __isMapLoadedChange?.Invoke((bool) change.Value, (bool) change.PreviousValue); break;
			case nameof(finished): __finishedChange?.Invoke((bool) change.Value, (bool) change.PreviousValue); break;
			case nameof(finishTime): __finishTimeChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(score): __scoreChange?.Invoke((float) change.Value, (float) change.PreviousValue); break;
			case nameof(address): __addressChange?.Invoke((string) change.Value, (string) change.PreviousValue); break;
			default: break;
		}
	}
}

