# Rozbudowa Gry Tetris

## Wprowadzone Zmiany

### 1. Poprawka przesuwania do bocznych krawędzi

**Problem**: Klocki czasami nie mogły być poprawnie dosunięte do krawędzi planszy.

**Rozwiązanie**: 
- Przepisano logikę w funkcji `isValidMove()` 
- Rozdzielono sprawdzanie granic poziomych i pionowych
- Poprawiono logikę sprawdzania kolizji z istniejącymi blokami
- Poprawiono parametr rotacji w funkcji `movePiece()`

### 2. System Bomb

**Nowe funkcjonalności**:
- **Szansa na pojawienie się**: 10% szansy na bombę zamiast normalnego klocka
- **Unikalny wygląd**: Czarna kula z brązowym lontem i złotą iskrą
- **Mechanika wybuchu**: Bomba eksploduje po umieszczeniu na planszy
- **Promień wybuchu**: 2 pola we wszystkich kierunkach
- **Efekty wizualne**: Animowany wybuch z gradientem kolorów i iskrami
- **Punktacja**: +50 punktów za każdy wybuch
- **Ograniczenia**: Bomby nie można obracać i nie mają cienia

### 3. Aktualizacje interfejsu

- Dodano sekcję "Bomby" w panelu sterowania
- Wyjaśniono mechanikę bomb dla gracza
- Dodano stylowanie dla nowej sekcji

## Szczegóły Techniczne

### Nowe zmienne globalne:
- `explosions[]` - tablica aktywnych wybuchów
- `bombChance` - szansa na pojawienie się bomby (0.1 = 10%)

### Nowe funkcje:
- `explodeBomb(centerX, centerY)` - obsługuje logikę wybuchu
- `updateExplosions()` - aktualizuje animacje wybuchów
- `drawExplosions()` - renderuje efekty wybuchów

### Modyfikowane funkcje:
- `createPiece()` - dodano możliwość tworzenia bomb
- `placePiece()` - dodano wywołanie wybuchu dla bomb
- `update()` - dodano aktualizację wybuchów
- `draw()` - dodano renderowanie wybuchów
- `drawBlock()` - dodano specjalne renderowanie bomb
- `isValidMove()` - poprawiona logika granic
- `handleKeyPress()` - bomby nie można obracać

## Jak Grać

1. **Normalne klocki**: Działają jak w tradycyjnym Tetrisie
2. **Bomby**: 
   - Pojawiają się losowo (10% szansy)
   - Nie można ich obracać
   - Po umieszczeniu eksplodują
   - Niszczą wszystkie bloki w promieniu 2 pól
   - Dają dodatkowe punkty

## Efekty Wizualne

- **Bomba**: Czarna kula z lontem i iskrą
- **Wybuch**: Animowany gradient (złoty → pomarańczowy → czerwony)
- **Iskry**: 8 żółtych iskier rozchodzących się od centrum
- **Animacja**: 30 klatek trwania z zanikającą przezroczystością

Gra jest teraz bardziej dynamiczna i oferuje dodatkową strategię związaną z wykorzystaniem bomb do oczyszczania planszy!