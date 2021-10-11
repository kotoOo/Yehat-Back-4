module.exports = () => {
  const log = core.makeLog("Mod.subscribe0");

  const ID_CARGO_EMAIL_0 = "emailDelivery0";

  const corsALL = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
      return res.send(200);
    } else {
      return next();
    }
  };

  const deliveryTopTools = async ({ name, email, message, type, url }) => {
    let html;
    if (~[ 'request-catalog-ru', 'request-catalog-en', 'request-catalog-de' ].indexOf(type)) {
      html = `
        На сайте TopTools было получен новый ЗАПРОС КАТАЛОГА.<br/>
        Адрес запроса: ${url}<br/>
        Тип запроса: ${type}<br/>
        -------<br/>
        E-Mail: ${core.escapeHTML(email)}<br/>
        -------<br/>
        Это сообщение доставлено автоматической службой, и отвечать на него не нужно.
      `;
    } else {
      html = `
        На сайте TopTools было получено новое сообщение.<br/>
        Адрес запроса: ${url}<br/>
        Тип запроса: ${type}<br/>
        -------<br/>
        Имя: ${core.escapeHTML(name || '- Имя не указано -')}<br/>
        E-Mail: ${core.escapeHTML(email)}<br/>
        Сообщение: ${core.escapeHTML(message || '').replace(/(?:\r\n|\r|\n)/g || '[ Пустое сообщение ]', '<br />')}<br/>
        -------<br/>
        Это сообщение доставлено автоматической службой, и отвечать на него не нужно.
      `;
    }

    log(html);

    const toA = [ "koto@camra.ru" ];

    const delivery = await ecs.create("EmailDelivery0", {
      emailDelivery0: {
        emails: toA, origin: "toptool", type, dtCreated: core.time()
      },
      emailDelivery0payload: {
        json: { 
          name: core.escapeHTML(name || ''), 
          email: core.escapeHTML(email || ''), 
          message: core.escapeHTML(message || ''), 
          url 
        }
      },
      located: {
        rel: ID_CARGO_EMAIL_0
      },
      connections: {
        project: "VBPCnsKIwpMRQsOWwrgfw4"
      }
    });
    // await delivery.saveFile.save();

    let f = 0;
    for(let receiver of toA) {
      try {
        await core.mods.mailer.send({ to: receiver, subject: "TopTools WebSite - New Message Received", html });
        delivery.emailDelivery0.success.push(receiver);
      } catch(e) {
        delivery.emailDelivery0.failures.push({ receiver, message: e.message });        
        f++;
      }
    }
    if (!f) delivery.emailDelivery0.allGood = true;
    delivery.saveFile.save();

    return { code: "ok", message: "Your request has been sent. Thank you!" };    
  };

  const deliveryPoormans = async ({ origin, ...stuff }) => {
    const knownDeliveries = { /* key - origin, value - handler */
      toptools: deliveryTopTools
    };

    if (knownDeliveries[origin]) {
      try {
        return knownDeliveries[origin](stuff);
      } catch(e) {
        return { code: "fail", details: `Failure at delivery for origin ${origin}: ${e.message}` };
      }
    } else {
      return { code: "fail", details: `Failed to deliver: Unknown origin ${origin}.` };
    }    
  };


  core.mods.express.app.all("/api/subscribe0/sub", corsALL, async (req, res) => {
    log("/api/subscribe0/sub", req.params, "body", req.body);

    res.send(await deliveryPoormans(req.body));
  });

  return {};
};