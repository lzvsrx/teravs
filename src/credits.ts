import project from '../config/project.json';

export function mountCredits() {
  const create = () => {
    const footer = document.createElement('footer'); footer.className = 'project-credits';
    const text = document.createElement('p'); text.textContent = `Criado por ${project.creator}.`;
    const copyright = document.createElement('small'); copyright.textContent = `© ${project.copyrightYear} ${project.rightsHolder}. Direitos sobre os elementos originais do Teravs reservados.`;
    const third = document.createElement('small'); third.textContent = 'Modelos e componentes de terceiros mantêm suas próprias licenças.';
    const link = document.createElement('a'); link.href = 'https://github.com/lzvsrx/teravs/blob/main/AUTHORSHIP.md'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Autoria, direitos e licenças';
    footer.append(text, copyright, third, link); return footer;
  };
  document.querySelector('#app main')!.append(create());
  document.querySelector('.auth-card')!.append(create());
}
