"use client";

import { getProviders, signIn, signOut } from "next-auth/react";

export interface CredentialsSignInInput {
  identifier: string;
  password: string;
  callbackUrl: string;
}

export interface OAuthSignInInput {
  callbackUrl: string;
}

export async function loadAuthProviders() {
  return getProviders();
}

export async function signInWithCredentials(input: CredentialsSignInInput) {
  return signIn("credentials", {
    identifier: input.identifier,
    password: input.password,
    callbackUrl: input.callbackUrl,
    redirect: false,
  });
}

export async function signInWithGoogle(input: OAuthSignInInput) {
  return signIn("google", {
    callbackUrl: input.callbackUrl,
    redirect: false,
  });
}

export async function signOutCurrentUser(callbackUrl: string = "/sign-in") {
  return signOut({
    redirect: false,
    callbackUrl,
  });
}
