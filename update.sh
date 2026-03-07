#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔄 Iniciando verificação de atualizações...${NC}"

# 1. Verifica se é um repositório Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Este projeto não foi clonado via Git. Não é possível atualizar automaticamente.${NC}"
    exit 1
fi

# 2. Busca mudanças no servidor
echo -e "📡 Consultando repositório remoto..."
git fetch origin

# Compara a versão local com a remota
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL = $REMOTE ]; then
    echo -e "${GREEN}✅ Você já está na versão mais recente!${NC}"
else
    echo -e "${YELLOW}✨ Nova versão detectada! Baixando...${NC}"
    git pull origin main || git pull origin master

    echo -e "${BLUE}🛠️  Rodando instalador para aplicar mudanças...${NC}"
    # Executa o install.sh para garantir novas dependências ou links
    chmod +x install.sh
    ./install.sh
    
    echo -e "${GREEN}🚀 Sistema atualizado com sucesso!${NC}"
fi
