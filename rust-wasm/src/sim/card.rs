#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub(crate) struct Card {
  pub(crate) rank: u8, // 0 = 2, ..., 12 = A
  pub(crate) suit: u8, // 0 = s, 1 = h, 2 = d, 3 = c
}

fn rank_from_char(ch: u8) -> Option<u8> {
  match ch {
    b'2' => Some(0),
    b'3' => Some(1),
    b'4' => Some(2),
    b'5' => Some(3),
    b'6' => Some(4),
    b'7' => Some(5),
    b'8' => Some(6),
    b'9' => Some(7),
    b'T' | b't' => Some(8),
    b'J' | b'j' => Some(9),
    b'Q' | b'q' => Some(10),
    b'K' | b'k' => Some(11),
    b'A' | b'a' => Some(12),
    _ => None,
  }
}

fn suit_from_char(ch: u8) -> Option<u8> {
  match ch {
    b's' | b'S' => Some(0),
    b'h' | b'H' => Some(1),
    b'd' | b'D' => Some(2),
    b'c' | b'C' => Some(3),
    _ => None,
  }
}

pub(crate) fn parse_card(token: &str) -> Option<Card> {
  let bytes = token.as_bytes();
  if bytes.len() != 2 {
    return None;
  }
  let rank = rank_from_char(bytes[0])?;
  let suit = suit_from_char(bytes[1])?;
  Some(Card { rank, suit })
}
