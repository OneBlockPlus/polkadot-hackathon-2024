package so.keyring.card;

import im.status.keycard.applet.SecureChannelSession;

public class TestSecureChannelSession extends SecureChannelSession {
  public void setOpen() {
    super.setOpen();
  }

  public byte getPairingIndex() {
    return getPairing().getPairingIndex();
  }
}
