<h1 align="center"> ts-smsc </h1>
<p align="center">
  <b>ts-smsc is a library smsc.ru for node.js </b>
</p>

## Documentations

https://webigorkiev.github.io/ts-smsc/

## Installation

```bash
npm i ts-smsc
```

##Usage

```typescript

import {smsc} from "ts-smsc";

const sender = smsc({
    
    // smsc.ConfigureOptions
    login: SMSC_LOGIN,
    password: SMSC_PASSWORD
});

// Send sms
sender.send({
   phones: "+38093100xxxx",
   mes: "Test text"
});

// Or send call code
sender.send({
    phones: "+38093100xxxx",
    mes: "Test text",
    call: 1
});
```

## Async Usage

```typescript
import {smsc} from "ts-smsc";

const sender = smsc({
    
    // smsc.ConfigureOptions
    login: SMSC_LOGIN,
    password: SMSC_PASSWORD
});

(async() => {
    
    // Send call code
    const {data, err, code} = await sender.send({
        phones: "+38093100xxxx",
        mes: "code",
        call: 1
    });
})();

```

## Source

https://smsc.ru/api/
