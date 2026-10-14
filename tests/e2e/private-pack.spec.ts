import { expect, nav, test } from './helpers'

const item = {
  id: 'p5x-modals-0001',
  part: 5,
  topic: 'modals',
  difficulty: 2,
  stem: 'All guests must ____ their badges at the entrance.',
  choices: ['show', 'showing', 'to show', 'shows'],
  answer: 0,
  trap: 'modal + base verb',
  explain: {
    en: 'After the modal must, use the base verb show.',
    th: 'หลัง must ต้องใช้กริยารูปเดิม show'
  },
  point: { key: 'must + V1', th: 'หลัง must ใช้กริยารูปเดิม', en: 'base verb after must', wrong: ['must showing'] },
  source: [{ file: 'UNIT_9.pdf', page: 3, no: 7 }],
  status: 'approved'
}

test.describe('Private question pack', () => {
  test('PRV-01 a private item adds its topic and shows its source after answering', async ({ launchApp }) => {
    const { page, errors } = await launchApp({ privateContent: { 'grammar/part5/modals.json': [item] } })
    await nav(page, 'Topic drills')
    await expect(page.locator('ul.tile-grid a.tile')).toHaveCount(14)
    await page.getByRole('link', { name: /Modal verbs/ }).click()
    await expect(page.getByText('Question 1 of 1')).toBeVisible()
    await page.locator('button.choice').first().click()
    await expect(page.locator('.explain-source')).toHaveText('From: UNIT_9.pdf p.3 #7')
    expect(errors).toEqual([])
  })

  test('PRV-02 without a private pack the new topics stay hidden', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    await expect(page.getByRole('link', { name: /Modal verbs/ })).toHaveCount(0)
  })

  test('PRV-03 a private item adds its point to the topic cheat sheet', async ({ launchApp }) => {
    const { page, errors } = await launchApp({ privateContent: { 'grammar/part5/modals.json': [item] } })
    await nav(page, 'Cheat sheet')
    await page.getByRole('link', { name: /Modal verbs/ }).click()
    const list = page.getByRole('region', { name: 'Points tested in drills (1)' })
    await expect(list.getByText('must + V1')).toBeVisible()
    await expect(list.getByText('base verb after must')).toBeVisible()
    await expect(list.getByText('✗ must showing')).toBeVisible()
    expect(errors).toEqual([])
  })
})
