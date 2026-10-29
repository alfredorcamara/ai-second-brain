# Guia de Contribuição (CONTRIBUTING.md)

Obrigado por querer contribuir com o **AI Second Brain**! Toda colaboração da comunidade com ideias, correções de bugs, novas integrações de IA e melhorias na documentação é muito bem-vinda.

---

## ⚖️ Licenciamento & CLA (Termo de Colaborador)

O projeto é distribuído sob a licença **[FSL-1.1-MIT](LICENSE)** (*Functional Source License — Source-Available / Fair-Code*).

- O código é 100% público e gratuito para uso pessoal, pesquisa, estudo e uso produtivo interno por desenvolvedores e empresas.
- É vedado o uso do software para criar e comercializar serviços ou produtos concorrentes diretos sem autorização expressa.

### Contrato de Licença de Colaborador (CLA)
Para garantir a segurança jurídica do projeto e manter o mantenedor com liberdade total para gerenciar, evoluir ou licenciar comercialmente a plataforma no futuro:
- **Ao submeter um Pull Request (PR) ou patch, você concorda automaticamente com os termos do [CLA.md](CLA.md).**
- O CLA assegura que você mantém os créditos de autoria, mas concede ao mantenedor a licença plena para distribuir, sublicenciar e comercializar as melhorias integradas ao produto.

---

## 🛠️ Como Contribuir

1. **Faça um Fork** do repositório no GitHub.
2. **Crie uma branch** para a sua feature ou correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
3. **Respeite os princípios do projeto**:
   - Zero dependências desnecessárias (manter o servidor leve e nativo com Node.js).
   - Catálogos de modelos 100% dinâmicos (sem listas fixas hardcoded).
   - Documentação como código e respeito às decisões arquiteturais (`ADRs`).
4. **Envie um Pull Request**:
   - Descreva com clareza o problema resolvido ou a melhoria implementada.
   - Certifique-se de que testes básicos e a inicialização via `npm start` continuem funcionando.

Dúvidas ou propostas de parcerias comerciais? Entre em contato diretamente com [@alfredorcamara](https://github.com/alfredorcamara).
