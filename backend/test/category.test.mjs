import test from "node:test";
import assert from "node:assert/strict";
import { classifyEmail } from "../dist/services/ai.service.js";

test("normal email is INBOX", () => assert.equal(classifyEmail("Normal", "Safe"), "INBOX"));
test("spam email is SPAM", () => assert.equal(classifyEmail("Spam", "Safe"), "SPAM"));
test("scam email is SCAM", () => assert.equal(classifyEmail("Normal", "Scam / Phishing"), "SCAM"));
test("scam wins over spam", () => assert.equal(classifyEmail("Spam", "Scam / Phishing"), "SCAM"));