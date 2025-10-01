// ===== SINGLETON PATTERN =====
// Класс для ведения боевого журнала (один на всю битву)
class BattleLogger {
  constructor() {
    if (BattleLogger.instance) {
      return BattleLogger.instance
    }
    this.logs = []
    BattleLogger.instance = this
  }

  log(message) {
    this.logs.push(message)
    console.log(message)
  }

  clear() {
    this.logs = []
  }

  getLogs() {
    return this.logs
  }
}

const logger = new BattleLogger()

// ===== FACTORY PATTERN =====
// Фабрика оружия
class WeaponFactory {
  static createWeapon(type) {
    switch (type) {
      case 'sword':
        return new Sword()
      case 'halberd':
        return new Halberd()
      case 'bow':
        return new Bow()
      default:
        throw new Error(`Unknown weapon type: ${type}`)
    }
  }
}

// Фабрика персонажей
class CharacterFactory {
  static createCharacter(race, name) {
    switch (race) {
      case 'orc':
        return new Orc(name)
      case 'dwarf':
        return new Dwarf(name)
      case 'human':
        return new Human(name)
      case 'elf':
        return new Elf(name)
      default:
        throw new Error(`Unknown race: ${race}`)
    }
  }
}

// ===== BUILDER PATTERN =====
// Строитель персонажей
class CharacterBuilder {
  constructor(race, name) {
    this.character = CharacterFactory.createCharacter(race, name)
  }

  withHealth(health) {
    this.character.health = health
    this.character.maxHealth = health
    return this
  }

  withStrength(strength) {
    this.character.strength = strength
    return this
  }

  withDodgeChance(dodgeChance) {
    this.character.dodgeChance = dodgeChance
    return this
  }

  withWeapon(weaponType) {
    this.character.weapon = WeaponFactory.createWeapon(weaponType)
    logger.log(
      `${this.character.name} взял ${this.character.weapon.name} [Урон: ${this.character.weapon.damage}]`
    )
    return this
  }

  withArmor() {
    this.character.putOnArmor()
    return this
  }

  build() {
    return this.character
  }
}

// ===== BASE CHARACTER CLASS =====
class Character {
  constructor(race, name, health, strength, dodgeChance = 20) {
    this.race = race
    this.name = name
    this.health = health
    this.maxHealth = health
    this.strength = strength
    this.weapon = null
    this.hasArmor = false
    this.armorValue = 0
    this.dodgeChance = dodgeChance
    this.dodgeCount = 0 // для статистики
  }

  putOnArmor() {
    this.hasArmor = true
    this.armorValue = 8
    logger.log(`${this.name} надел железную броню [+${this.armorValue} защиты]`)
  }

  takeWeapon(weapon) {
    this.weapon = weapon
    logger.log(`${this.name} взял ${weapon.name} [Урон: ${weapon.damage}]`)
  }

  isAlive() {
    return this.health > 0
  }

  tryDodge() {
    const random = Math.random() * 100
    if (random <= this.dodgeChance) {
      this.dodgeCount++
      logger.log(`✨ ${this.name} уклонился от атаки!`)
      return true
    }
    return false
  }

  attack(target) {
    if (!this.isAlive() || !target.isAlive()) return

    // Попытка уклониться
    if (target.tryDodge()) {
      return
    }

    const baseDamage = this.strength + (this.weapon ? this.weapon.damage : 0)
    const finalDamage = Math.max(baseDamage - target.armorValue, 1)

    target.health -= finalDamage

    logger.log(`${this.name} атакует ${target.name}!`)
    logger.log(
      `Урон: ${this.strength} (сила) + ${this.weapon.damage} (${this.weapon.name}) = ${baseDamage}`
    )
    logger.log(`Броня нейтрализует: ${target.armorValue}`)
    logger.log(`${target.name} получает ${finalDamage} урона!`)
    logger.log(
      `Здоровье ${target.name}: ${Math.max(target.health, 0)}/${
        target.maxHealth
      }`
    )

    if (!target.isAlive()) {
      logger.log(`💀 ${target.name} пал в бою!`)
    }
    logger.log('---')
  }
}

// ===== CHARACTER SUBCLASSES =====
class Orc extends Character {
  constructor(name) {
    super('Орк', name, 115, 18, 5) // Орки менее ловкие
  }
}

class Dwarf extends Character {
  constructor(name) {
    super('Гном', name, 110, 20, 10)
  }
}

class Human extends Character {
  constructor(name) {
    super('Человек', name, 100, 15, 15)
  }
}

class Elf extends Character {
  constructor(name) {
    super('Эльф', name, 90, 14, 30) // Эльфы более ловкие
  }
}

// ===== WEAPON CLASSES =====
class Sword {
  constructor() {
    this.name = 'Меч'
    this.damage = 12
  }
}

class Halberd {
  constructor() {
    this.name = 'Алебарда'
    this.damage = 16
  }
}

class Bow {
  constructor() {
    this.name = 'Лук'
    this.damage = 10
  }
}

// ===== BATTLE SYSTEM =====
class BattleRoyale {
  constructor() {
    this.characters = []
    this.round = 0
  }

  addCharacter(character) {
    this.characters.push(character)
  }

  startBattle() {
    logger.log('⚔️  НАЧАЛО БИТВЫ! ')
    logger.log('=====================================')

    const aliveCharacters = this.characters.filter((char) => char.isAlive())

    while (aliveCharacters.length > 1) {
      this.round++
      this.executeRound(aliveCharacters)

      // Удаляем мертвых персонажей
      for (let i = aliveCharacters.length - 1; i >= 0; i--) {
        if (!aliveCharacters[i].isAlive()) {
          logger.log(`🚩 ${aliveCharacters[i].name} выбывает из битвы!`)
          aliveCharacters.splice(i, 1)
        }
      }
    }

    this.declareWinner(aliveCharacters)
    this.showStatistics()
  }

  executeRound(aliveCharacters) {
    logger.log(`\n🛡️  РАУНД ${this.round} `)
    logger.log('Живые бойцы: ' + aliveCharacters.map((c) => c.name).join(', '))

    for (let i = 0; i < aliveCharacters.length; i++) {
      const attacker = aliveCharacters[i]

      for (let j = 0; j < aliveCharacters.length; j++) {
        if (i !== j && attacker.isAlive() && aliveCharacters[j].isAlive()) {
          attacker.attack(aliveCharacters[j])
        }
      }
    }
  }

  declareWinner(aliveCharacters) {
    if (aliveCharacters.length === 1) {
      logger.log(`\n🎉 ПОБЕДИТЕЛЬ: ${aliveCharacters[0].name}!`)
      logger.log(
        `❤️  ${aliveCharacters[0].name} выжил с ${aliveCharacters[0].health} HP!`
      )
    } else {
      logger.log('\n⚰️  Все пали в бою! Ничья!')
    }
  }

  showStatistics() {
    logger.log('\n📊 СТАТИСТИКА БИТВЫ:')
    this.characters.forEach((char) => {
      logger.log(`${char.name}: ${char.dodgeCount} успешных уклонений`)
    })

    const totalDodges = this.characters.reduce(
      (total, char) => total + char.dodgeCount,
      0
    )
    const elfDodges = this.characters
      .filter((char) => char.race === 'Эльф')
      .reduce((total, elf) => total + elf.dodgeCount, 0)

    logger.log(`Всего уклонений: ${totalDodges}`)
    logger.log(`Уклонения эльфов: ${elfDodges}`)
  }
}

// ===== USAGE EXAMPLE =====
// Создаем персонажей с помощью Builder
const thrall = new CharacterBuilder('orc', 'Тралл')
  .withArmor()
  .withWeapon('halberd')
  .build()

const gimli = new CharacterBuilder('dwarf', 'Гимли')
  .withArmor()
  .withWeapon('sword')
  .build()

const aragorn = new CharacterBuilder('human', 'Арагорн')
  .withArmor()
  .withWeapon('sword')
  .build()

const legolas = new CharacterBuilder('elf', 'Леголас')
  .withArmor()
  .withWeapon('bow')
  .build()

// Создаем и запускаем битву
const battle = new BattleRoyale()
battle.addCharacter(thrall)
battle.addCharacter(gimli)
battle.addCharacter(aragorn)
battle.addCharacter(legolas)

// Запускаем битву
battle.startBattle()

// Можно посмотреть полный лог битвы
console.log('\n=== ПОЛНЫЙ ЛОГ БИТВЫ ===')
logger.getLogs().forEach((log) => console.log(log))
