export type SignInGateState = "pending" | "signed_in" | "signed_out";

export function resolveSignInGateState(input: {
  isPending: boolean;
  hasUser: boolean;
}): SignInGateState {
  if (input.isPending) return "pending";
  return input.hasUser ? "signed_in" : "signed_out";
}
