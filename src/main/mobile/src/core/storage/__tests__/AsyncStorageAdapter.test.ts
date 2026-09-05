import { AsyncStorageAdapter } from "../AsyncStorageAdapter";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const AsyncStorage = require("@react-native-async-storage/async-storage");

describe("AsyncStorageAdapter", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
    jest.clearAllMocks();
  });

  describe("getItem", () => {
    it("should return value when key exists", async () => {
      AsyncStorage.getItem.mockResolvedValue("test-value");

      const result = await adapter.getItem("test-key");

      expect(result).toBe("test-value");
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("test-key");
    });

    it("should return null when key does not exist", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await adapter.getItem("non-existent-key");

      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("non-existent-key");
    });

    it("should return null when error occurs", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const result = await adapter.getItem("error-key");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle different data types", async () => {
      const jsonData = JSON.stringify({ key: "value" });
      AsyncStorage.getItem.mockResolvedValue(jsonData);

      const result = await adapter.getItem("json-key");

      expect(result).toBe(jsonData);
    });
  });

  describe("setItem", () => {
    it("should set value successfully", async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await expect(adapter.setItem("key", "value")).resolves.toBeUndefined();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("key", "value");
    });

    it("should handle empty string value", async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await expect(adapter.setItem("key", "")).resolves.toBeUndefined();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("key", "");
    });

    it("should handle JSON string value", async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);
      const jsonValue = JSON.stringify({ data: "test" });

      await expect(
        adapter.setItem("json-key", jsonValue),
      ).resolves.toBeUndefined();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith("json-key", jsonValue);
    });

    it("should handle error when setting item fails", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      AsyncStorage.setItem.mockRejectedValue(new Error("Set error"));

      await expect(
        adapter.setItem("error-key", "value"),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("removeItem", () => {
    it("should remove item successfully", async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await expect(
        adapter.removeItem("key-to-remove"),
      ).resolves.toBeUndefined();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("key-to-remove");
    });

    it("should handle error when removing item fails", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      AsyncStorage.removeItem.mockRejectedValue(new Error("Remove error"));

      await expect(adapter.removeItem("error-key")).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("clear", () => {
    it("should clear all items successfully", async () => {
      AsyncStorage.clear.mockResolvedValue(undefined);

      await expect(adapter.clear()).resolves.toBeUndefined();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it("should handle error when clearing fails", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      AsyncStorage.clear.mockRejectedValue(new Error("Clear error"));

      await expect(adapter.clear()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
