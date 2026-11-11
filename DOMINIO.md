# Guia de Configuração de Domínio Próprio - FitCoach Pro

Este guia explica como apontar seu próprio domínio (ex: `fitcoachpro.com.br` ou `app.fitcoachpro.com.br`) para o aplicativo hospedado no GitHub Pages.

---

### Passo 1: Comprar o Domínio
Se você ainda não comprou, você pode registrar domínios `.com.br` diretamente no site oficial [Registro.br](https://registro.br) por R$ 40/ano.

---

### Passo 2: Configurar o DNS no seu Provedor (Registro.br ou Cloudflare)

#### Opção A: Subdomínio (Recomendado, ex: `app.seudominio.com.br`)
No painel de DNS do seu domínio, crie um registro do tipo **CNAME**:
* **Tipo:** `CNAME`
* **Nome / Host:** `app`
* **Destino / Valor:** `personaljoaoptu-dot.github.io`
* **TTL:** Automático ou 3600

#### Opção B: Domínio Principal (ex: `seudominio.com.br`)
No painel de DNS, crie 4 registros do tipo **A** apontando para os IPs oficiais do GitHub:
* **Tipo:** `A` | **Nome:** `@` | **IP:** `185.199.108.153`
* **Tipo:** `A` | **Nome:** `@` | **IP:** `185.199.109.153`
* **Tipo:** `A` | **Nome:** `@` | **IP:** `185.199.110.153`
* **Tipo:** `A` | **Nome:** `@` | **IP:** `185.199.111.153`

E crie também um registro CNAME para o `www`:
* **Tipo:** `CNAME` | **Nome:** `www` | **Valor:** `personaljoaoptu-dot.github.io`

---

### Passo 3: Configurar no GitHub

1. Acesse seu repositório no GitHub: `https://github.com/personaljoaoptu-dot/fitcoach-pro`
2. Vá em **Settings → Pages**.
3. No campo **Custom domain**, digite o seu domínio (ex: `app.seudominio.com.br`) e clique em **Save**.
4. Marque a caixinha **Enforce HTTPS** (o GitHub gera o certificado SSL grátis automaticamente em alguns minutos).

Pronto! Seu FitCoach Pro responderá diretamente no seu próprio endereço profissional.
