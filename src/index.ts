// SMSC.RU API (smsc.ru) версия 1.1 (03.07.2019) to typescript 2021
import FormData from "form-data";
import fs from "fs";
import crypto from "crypto";

/**
 * Smsc types
 */
export namespace smsc {

    /**
     * Request callback function
     */
    export declare type RequestCallback = (

        /**
         * Response payload
         */
        data: Record<string, any>,

        /**
         * Raw response
         */
        raw: any,

        /**
         * Error text
         */
        err: string,

        /**
         * Error code
         */
        code: number
    ) => void;

    /**
     * Response object
     */
    export interface Response {

        /**
         * Response payload
         */
        data: Record<string, any>,

        /**
         * Raw response
         */
        raw: any,

        /**
         * Error text
         */
        err: string,

        /**
         * Error code
         */
        code: number
    }

    /**
     * Configuration options
     */
    export interface ConfigureOptions {

        /**
         * Client login
         */
        login: string,

        /**
         * Client password
         * password or sha1 password`s hash
         */
        password: string,

        /**
         * Need use ssl
         */
        ssl?: boolean,

        /**
         * Charset
         * default: "utf-8"
         */
        charset?: BufferEncoding,

        /**
         * The sender's name displayed on the recipient's phone.
         * English letters, numbers, space and some symbols are allowed.
         * Length - 11 characters or 15 digits
         */
        sender?: string

    }

    /**
     * Params for method send
     * https://smsc.ru/api/
     */
    export interface MessageParams {
        phones: string,
        mes: string,
        login?: string,
        psw?: string,

        // Addition params https://smsc.ru/api/http/#menu
        id?: number,
        sender?: string,
        translit?: 0 | 1 | 2,
        tinyurl?: 0 | 1,
        time?: string, // time for send
        tz?: string, //  Timezone
        period?: number, // in hours
        freq?: number // 1-1440 minutes,
        bin?: 0 | 1,
        push?: 0 | 1,
        hlr?: 0 | 1,
        ping?: 0 | 1,
        mms?: 0 | 1,
        mail?: 0 | 1,
        soc?: 0 | 1,
        viber?: 0 | 1,
        fileurl?: string,
        call?: 0 | 1,
        voice?: "m" | "m2" | "w" | "w2",
        param?: string,
        subj?: string,
        charset?: "windows-1251" | "utf-8" | "koi8-r",
        cost?: 0 | 1 | 2 | 3,
        list?: string, // phones1:mes1\nphones2:mes2
        valid?: number,
        maxsms?: number, //max sms
        imgcode?: string,
        userip?: string,
        err?: 0 | 1,
        op?: 0 | 1,
        pp?: number
    }
}

/**
 * SMSC.RU API
 */
class Smsc {
    PHONE_TYPES = {
        "string" : 1,
        "number" : 2
    };

    host = "smsc.ru";
    defFmt = 3;
    ssl:boolean = false;
    login: string;
    password: string;
    charset: BufferEncoding;
    sender?: string;

    /**
     * Set configuration
     * @param prs
     */
    constructor(prs: smsc.ConfigureOptions) {
        this.login = prs.login;
        this.password = prs.password.length === 40
            ? prs.password
            : (this.constructor as typeof Smsc).sha1(prs.password);
        this.sender = prs.sender;
        this.ssl = !!prs.ssl;
        this.charset = prs.charset || "utf-8";
    }

    /**
     * Send all message
     * async
     * @param data
     */
    public send(data: smsc.MessageParams): Promise<smsc.Response>;

    /**
     * Send all message
     * default type sms
     * @param data
     * @param clb
     */
    public send(data: smsc.MessageParams, clb?:smsc.RequestCallback): void|Promise<smsc.Response> {

        if(clb) {
            this.readUrl({file : "send.php", data : data}, clb);
        } else {
            return new Promise(resolve => this.readUrl(
                {file : "send.php", data : data},
                (data, raw, err , code) => {
                    resolve({data, raw, err, code})
                }));
        }
    }

    /**
     * Get balance
     * async
     */
    public balance(): Promise<smsc.Response>;

    /**
     * Get balance
     * @param clb
     */
    public balance(clb?:smsc.RequestCallback): void|Promise<smsc.Response> {

        if(clb) {
            this.readUrl({file: "balance.php", data: {cur: 1}}, clb);
        } else {
            return new Promise(resolve => this.readUrl(
                {file : "balance.php", data: {cur: 1}},
                (data, raw, err , code) => {
                    resolve({data, raw, err, code})
                }));
        }
    }

    /**
     * Create sha1 hash
     * @param str input string
     * @returns sha1 hash
     * @private
     */
    private static sha1(str: string) {

        return crypto.createHash('sha1')
            .update(str)
            .digest("hex");
    }

    /**
     * Get full url
     * @param www domen
     * @private
     */
    private getHost(www?: string) {

        if(!www) {
            www = "";
        }

        return (this.ssl? "https://" : "http://") + www + this.host + "/sys/";
    }

    /**
     * Check if val in array
     * @param arr array
     * @param val needle
     * @private
     */
    private static isInArr(arr: any, val: any) {

        if(!arr || !arr.length) {
            return false;
        }

        return arr.indexOf(val) !== -1;
    }

    /**
     * Input params adapter
     * @param data input params
     * @param notConvert some excluding
     * @private
     */
    private convertData(data: Record<string, any>, notConvert?: Array<string>) {

        if(data.fmt) {
            delete data.fmt;
        }

        if(data.msg) {
            data.mes = data.msg;
            delete data.msg;
        }

        if(data.message) {
            data.mes = data.message;
            delete data.message;
        }

        if(data.phone && !(this.constructor as typeof Smsc).isInArr(notConvert, "phone")) {
            data.phones = data.phone;
            delete data.phone;
        }

        if(data.number) {
            data.phones = data.number;
            delete data.number;
        }

        if(data.list) {
            let list = "";

            for(const i in data.list) {

                if(data.list.hasOwnProperty(i)) {
                    list += i + ":" + data.list[i]+"\n";
                }
            }
            data.list = list;
            delete data.mes;
        }

        if(data.phones && !(typeof data.phones in this.PHONE_TYPES)) {
            data.phones = data.phones.join(",");
        }
    }

    /**
     * Convert files to FormData
     * @param form FormData object
     * @param data input params
     * @private
     */
    private static convertFiles(form: FormData, data: Record<string, any>) {

        if(!data.files) {
            return;
        }

        if(typeof data.files === "string") {
            data.files =  [data.files];
        }

        for(const i in data.files) {

            if(data.files.hasOwnProperty(i)) {
                const f = data.files[i];
                const bin = fs.readFileSync(f);
                form.append(i, bin, {
                    filename: f
                });
            }
        }

        delete data.files;
    }

    /**
     * Read response url
     * @param prs request params raw
     * @param clb cllback function if need
     * @param notConvert
     * @private
     */
    private readUrl(
        prs: Record<string, any>,
        clb?: smsc.RequestCallback,
        notConvert?: Array<string>
    ) {
        const fmt = prs.fmt ? prs.fmt : this.defFmt;
        const fd = new FormData();
        fd.append("fmt", fmt);
        fd.append("login", this.login);
        fd.append("psw", this.password);
        fd.append("charset", this.charset);

        // Default sender
        if(this.sender) {
            fd.append("sender", this.sender);
        }

        if(prs.type) {
            fd.append(prs.type, 1);
        }

        if(prs.data) {
            this.convertData(prs.data, notConvert);

            if(prs.data.files) {
                (this.constructor as typeof Smsc).convertFiles(fd, prs.data);
            }

            for(const i in prs.data) {

                if(prs.data.hasOwnProperty(i)) {
                    fd.append(i, prs.data[i]);
                }
            }
        }

        let www = "";
        let count = 0;
        const submit = () => {
            fd.submit(this.getHost(www) + prs.file,  (err, res) => {

                if(err) {

                    if(count++ < 5) {
                        www = "www"+ (count !== 1 ? count : "")+".";
                        submit();
                    } else {
                        const error = {
                            error : "Server Not Work",
                            error_code : 100
                        };

                        if(clb) {
                            clb(error, JSON.stringify(error), error.error, error.error_code);
                        }
                    }

                    return;
                }

                const body: Array<string> = [];
                res.setEncoding(this.charset);
                res.on("data",  (chunk) => body.push(chunk));
                res.on("end", () => {
                    if(clb) {
                        const data = body.join("");
                        const d = JSON.parse(data);
                        clb(d, data, d.error_code ? d.error : null, d.error_code ? d.error_code : null);
                    }
                })

            });
        };

        submit();
    }
}

/**
 * Entry point
 */
export const smsc = (prs: smsc.ConfigureOptions) => new Smsc(prs);