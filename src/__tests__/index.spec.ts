import { mocked } from 'ts-jest/utils';
import {smsc, Smsc} from "../index";
import FormData from "form-data";
import {PassThrough} from "stream";

jest.mock("form-data", () => {
    return jest.fn().mockImplementation(() => {

        return {
            append: () => {},
            submit: (params: any, fn: CallableFunction) => {
                const stream = new PassThrough();
                fn(null, stream);
                stream.emit("data", JSON.stringify({"code":1234}));
                stream.emit("end");
            }
        };
    });
});

describe("package structure", () => {

    /**
     * access to private
     */
    const smscProto = Object.getPrototypeOf(smsc({login: "test", password: "test"}));

    it("smsc a function", () => {
        expect(smsc).toBeInstanceOf(Function);
    });
    it("smsc return Smsc instance", () => {
        expect(smsc({login: "test", password: "test"})).toBeInstanceOf(Smsc);
    });
    it("sha1", () => {
        expect(smscProto.constructor.sha1.length).toEqual(1);
    });
    it("getHost", () => {
        expect(smscProto.getHost.length).toEqual(1);
    });
    it("send", () => {
        expect(smscProto.send.length).toEqual(2);
    });
    it("balance", () => {
        expect(smscProto.balance.length).toEqual(1);
    });
    it("isInArr", () => {
        expect(smscProto.constructor.sha1.length).toEqual(1);
    });
    it("convertData", () => {
        expect(smscProto.convertData.length).toEqual(2);
    });
    it("convertFiles", () => {
        expect(smscProto.constructor.convertFiles.length).toEqual(2);
    });
    it("readUrl", () => {
        expect(smscProto.readUrl.length).toEqual(3);
    });
});

describe("test request", () => {
    beforeEach(() => {
        (FormData as unknown as jest.Mock).mockClear();
    });
    it("send", async () => {
        const {data} = await smsc({login: "test", password: "test"}).send({
            phones: "+38093100xxxx",
            mes: "code",
            call: 1
        });
        expect(data.code).toEqual(1234)
    });
    it("balance", async() => {
        const {data} = await smsc({login: "test", password: "test"}).balance();
        expect(data.code).toEqual(1234)
    })
})