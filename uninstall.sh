#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}===============================================${NC}"
echo -e "${RED}          DESINSTALADOR - NEWS SYSTEM          ${NC}"
echo -e "${RED}===============================================${NC}\n"

# 1. REMOÇÃO DO BINÁRIO GLOBAL
BIN_PATH="$HOME/.local/bin/news"

if [ -f "$BIN_PATH" ]; then
    echo -e "🗑️  Removendo atalho global em $BIN_PATH..."
    rm "$BIN_PATH"
    echo -e "${GREEN}✅ Comando 'news' removido com sucesso.${NC}"
else
    echo -e "ℹ️  O comando 'news' não foi encontrado em ~/.local/bin."
fi

echo -e "\n-----------------------------------------------"

# 2. LIMPEZA DE ARQUIVOS LOCAIS
echo -e "${BLUE}Deseja realizar uma limpeza nos arquivos locais?${NC}"
echo -e "Isso removerá a pasta 'node_modules' (Puppeteer) e o cache de notícias."
read -p "(s/n): " clean_choice

if [[ $clean_choice == "s" || $clean_choice == "S" ]]; then
    echo -e "\n🧹 Limpando arquivos..."
    
    [ -d "node_modules" ] && rm -rf node_modules && echo " - node_modules removida."
    [ -d "cache/artigos" ] && rm -rf cache/artigos && echo " - cache de artigos removido."
    [ -f "package-lock.json" ] && rm "package-lock.json" && echo " - package-lock removido."
    
    echo -e "${GREEN}✅ Limpeza concluída.${NC}"
else
    echo -e "⚠️  Arquivos locais e cache foram mantidos."
fi

# 3. FINALIZAÇÃO
echo -e "\n${RED}===============================================${NC}"
echo -e "   O sistema foi desvinculado do seu Linux.    "
echo -e "   Agora você pode apagar esta pasta se quiser. "
echo -e "${RED}===============================================${NC}"
