import { describe, expect, it } from "vitest";

import { getClientEnv } from "@/config/env/client-env";
import { getServerEnv } from "@/config/env/server-env";

describe("config/env", () => {
  it("parses server env with defaults", () => {
    const env = getServerEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.DEFAULT_COUNTRY_CODE).toBe("BD");
    expect(env.DEFAULT_LOCALE).toBe("bn-BD");
    expect(env.DEFAULT_CURRENCY).toBe("BDT");
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("parses client env with defaults", () => {
    const env = getClientEnv({});

    expect(env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE).toBe("BD");
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toBe("bn-BD");
    expect(env.NEXT_PUBLIC_DEFAULT_CURRENCY).toBe("BDT");
    expect(env.NEXT_PUBLIC_LOG_LEVEL).toBe("info");
  });
});