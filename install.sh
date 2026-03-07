#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   ASSISTENTE DE INSTALAÇÃO - NEWS SYSTEM      ${NC}"
echo -e "${BLUE}===============================================${NC}\n"

# --- FASE 1: AUDITORIA ---
echo -e "🔍 ${YELLOW}Conferindo dependências do sistema...${NC}"
faltando_sistema=()
binarios=("node" "npm" "fzf" "jq")

for bin in "${binarios[@]}"; do
    if command -v "$bin" &> /dev/null; then
        echo -e "[ ${GREEN}OK${NC} ] $bin"
    else
        echo -e "[ ${RED}!!${NC} ] $bin ${RED}(Não instalado)${NC}"
        faltando_sistema+=("$bin")
    fi
done

# Verifica se a pasta node_modules existe
precisa_npm=false
if [ ! -d "node_modules" ]; then
    echo -e "[ ${RED}!!${NC} ] Módulos Node (Puppeteer) ${RED}(Não instalados)${NC}"
    precisa_npm=true
else
    echo -e "[ ${GREEN}OK${NC} ] Módulos Node encontrados."
fi

# --- FASE 2: LÓGICA DE INSTALAÇÃO ---

# Se não falta nada, encerra ou pergunta se quer reinstalar
if [ ${#faltando_sistema[@]} -eq 0 ] && [ "$precisa_npm" = false ]; then
    echo -e "\n${GREEN}✨ Tudo pronto! Nada para instalar.${NC}"
    read -p "Deseja apenas reconfigurar o comando global 'news'? (s/n): " rec
    if [[ $rec != "s" ]]; then exit 0; fi
else
    echo -e "\n${YELLOW}🛠️  Ações necessárias:${NC}"
    [ ${#faltando_sistema[@]} -gt 0 ] && echo -e "  - Instalar pacotes: ${faltando_sistema[*]}"
    [ "$precisa_npm" = true ] && echo -e "  - Instalar dependências do projeto (npm install)"

    read -p "Prosseguir com as correções? (s/n): " confirm
    if [[ $confirm != "s" && $confirm != "S" ]]; then
        echo -e "${RED}Instalação cancelada.${NC}"
        exit 1
    fi
fi

# --- FASE 3: EXECUÇÃO (SÓ RODA O QUE PRECISA) ---

# Só pede SUDO se faltar binários no sistema
if [ ${#faltando_sistema[@]} -gt 0 ]; then
    echo -e "\n${BLUE}📦 Instalando pacotes do sistema...${NC}"
    sudo apt update
    sudo apt install -y jq fzf nodejs npm fonts-liberation libnss3 libgbm1 libasound2 # e outras libs do puppeteer
fi

# Instalação do projeto
if [ "$precisa_npm" = true ] || [ ! -f "package-lock.json" ]; then
    echo -e "\n${BLUE}🛠️  Instalando módulos Node.js...${NC}"
    [ ! -f "package.json" ] && npm init -y
    npm pkg set type="module"
    npm install puppeteer
fi

# --- FASE 4: LINK BINÁRIO (SEMPRE RECONFIRMA) ---
echo -e "\n${BLUE}🔗 Configurando comando 'news' em ~/.local/bin...${NC}"
mkdir -p "$HOME/.local/bin"
APP_DIR=$(pwd)

cat <<EOF > "$HOME/.local/bin/news"
#!/bin/bash
cd "$APP_DIR"
./news.sh "\$@"
EOF

chmod +x "$HOME/.local/bin/news"
chmod +x news.sh

# --- FINALIZAÇÃO ---
echo -e "\n${GREEN}✅ Configuração finalizada!${NC}"
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo -e "${YELLOW}⚠️  Lembre-se de adicionar ~/.local/bin ao seu PATH no .bashrc${NC}"
fi
