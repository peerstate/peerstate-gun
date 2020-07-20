import {
  createPeerState,
  AuthFilter,
  EncryptionFilter,
  Keychain,
  withRetries,
  Operation,
  Action,
} from "@peerstate/core";
import { IGunChainReference } from "gun/types/chain";

type InternalState<T> = {
  peerState: T;
  keys: Keychain;
};

const applyJsonPatch = function <T>(state: T, action: Operation): T {
  // TODO: update gun chain reference with JSON patch
  // how do we make sure this bypasses middleware?
  return state;
};
const jsonPatchOperationFromGunPut = (foo: null): Operation => ({
  path: "/void",
  op: "add",
  value: null,
});
const peerstateActionFromGunPut = (foo: null): Action => ({
  senderToken: "sender token",
  operationToken: '{ path: "/void", op: "add", value: null }',
});

export const peerstateGun = function <IGunChainReference>(
  authFilter: AuthFilter<IGunChainReference>,
  encryptionFilter: EncryptionFilter<IGunChainReference>,
  keychain: Keychain
) {
  return (ctx: any) => {
    if (ctx.once) {
      return;
    }
    const { nextState, sign: signWithState } = withRetries(
      createPeerState<IGunChainReference>(
        authFilter,
        encryptionFilter,
        keychain,
        applyJsonPatch
      )
    );
    ctx.on("out", async function (this: { to: any }, msg: any) {
      var to = this.to;
      if (msg.put) {
        msg.put = await signWithState(
          msg.$.back(-1),
          jsonPatchOperationFromGunPut(msg.put)
        );
      } else if (msg.get) {
        console.log(
          "not sure what a get 'coming in' is so I'm ignoring this for now"
        );
      } else {
        console.error({ msg });
        throw new Error("something coming in I don't know about");
      }
      // process message.
      to.next(msg); // pass to next middleware
    });
    ctx.on("in", async function (this: { to: any }, msg: any) {
      var to = this.to;
      if (msg.put) {
        msg.put = await nextState(
          msg.$.back(-1),
          peerstateActionFromGunPut(msg.put)
        );
      } else if (msg.get) {
        console.log(
          "not sure what a get 'coming in' is so I'm ignoring this for now"
        );
      } else {
        console.error({ msg });
        throw new Error("something coming in I don't know about");
      }

      to.next(msg); // pass to next middleware
    });
  };
};
