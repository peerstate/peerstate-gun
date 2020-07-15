import {
  createPeerState,
  AuthFilter,
  EncryptionFilter,
  Keychain,
  withRetries,
  Action,
} from "@peerstate/core";
// TODO: add this to core
import { compare } from "deep-entries";

type InternalState<T> = {
  peerState: T;
  keys: Keychain;
};

export const peerstateGun = function <StateTreeType>(
  authFilter: AuthFilter<StateTreeType>,
  encryptionFilter: EncryptionFilter<StateTreeType>,
  keychain: Keychain
) {
  // const { nextState, sign: signWithState } = withRetries(
  //   createPeerState(authFilter, encryptionFilter, keychain)
  // );
  // const [state, setState] = useState<InternalState<StateTreeType>>({
  //   peerState: initialState,
  //   keys: keychain,
  // });
  // return {
  //   state: state.peerState,
  //   dispatch: (a: Action | false) =>
  //     nextState(state, a).then((s: InternalState<StateTreeType>) =>
  //       setState(s)
  //     ),
  //   sign: signWithState.bind(null, state),
  // };
  return (ctx: any) => {
    if (ctx.once) {
      return;
    }
    ctx.on("out", function (this: { to: any }, msg: any) {
      var to = this.to;
      console.log({ msg, out: "" });
      // process message.
      to.next(msg); // pass to next middleware
    });
    ctx.on("in", function (this: { to: any }, msg: any) {
      var to = this.to;
      // const patch = compare({}, msg.put);
      console.log({ msg, in: "" });

      // //that's all... no magic, no bloated framework
      // for (var [key, value, path] of traverse(o)) {
      //   // do something here with each key and value
      //   console.log(key, value, path);
      // }
      // process message.
      to.next(msg); // pass to next middleware
    });
  };
};
