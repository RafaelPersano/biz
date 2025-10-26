<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rJaKObTb8WnoPoGgN93ggBHgodhsONH8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


---

## Deploy rápido no GitHub + Vercel (usando Codespaces opcional)

### 1) Subir para o GitHub
```bash
git init
git add .
git commit -m "preparar para deploy"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

### 2) (Opcional) Trabalhar no Codespaces (VSCode na nuvem)
- No GitHub, clique em **Code → Codespaces → Create codespace on main**.
- Abra o terminal no Codespace e rode:
```bash
npm install
npm run dev
```
- Para criar o `.env.local` no Codespace, copie `.env.example` e adicione sua chave:
```
cp .env.example .env.local
# then edit .env.local and set VITE_OPENHOUTER_API_KEY
```

### 3) Deploy no Vercel
1. Vá para vercel.com → Add New Project → Import Git Repository (escolha seu repo)
2. Vercel detecta Vite automaticamente.  
3. No painel do projeto, vá em **Settings → Environment Variables** e adicione:
   - `VITE_OPENHOUTER_API_KEY` = **sua_key_aqui**
4. Clique em **Deploy**. Depois do deploy, faça um redeploy se adicionou variáveis.

### 4) Segurança
- **Não** comite suas chaves no repositório. Use `.env.local` (no Codespace) e as variáveis de ambiente do Vercel.
- Se precisar de chamadas seguras (para esconder a chave), mova a chamada para um backend (Node/Flask) mais tarde.

--- 
