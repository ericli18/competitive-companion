import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TophProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://toph.co/p/*', 'https://toph.co/arena?contest=*/p/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Toph').setUrl(url);

    task.setName(elem.querySelector('.artifact h1').textContent);

    const limitsStr = elem.querySelector('.limits').textContent;

    const [, timeAmount, timeUnit] = /([0-9.]+)(.*),/.exec(limitsStr);
    task.setTimeLimit(parseFloat(timeAmount) * (timeUnit === 'ms' ? 1 : 1000));

    const [, memoryAmount, memoryUnit] = /, ([0-9.]+) (.*)/.exec(limitsStr);
    task.setMemoryLimit(parseFloat(memoryAmount) * (memoryUnit === 'MB' ? 1 : 1024));

    elem.querySelectorAll('.table.samples').forEach(table => {
      const blocks = table.querySelectorAll('tbody > tr > td > pre');
      task.addTest(blocks[0].textContent.trim(), blocks[1].textContent.trim());
    });

    return task.build();
  }
}
