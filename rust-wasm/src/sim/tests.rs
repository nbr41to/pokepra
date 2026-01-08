use super::card::Card;
use super::eval::best_of;
use super::simulate_vs_list_with_ranks;

fn decode_card(v: u32) -> String {
  let rank = v >> 2;
  let suit = v & 0b11;
  let rank_char = "23456789TJQKA"
    .as_bytes()
    .get(rank as usize)
    .copied()
    .unwrap_or(b'?') as char;
  let suit_char = ['s', 'h', 'd', 'c']
    .get(suit as usize)
    .copied()
    .unwrap_or('?');
  format!("{rank_char}{suit_char}")
}

#[test]
fn hero_vs_qq_regression() {
  // quick sanity: deterministic scores for the given flop
  let hero_score = best_of(&[
    Card { rank: 6, suit: 2 }, // 8d
    Card { rank: 10, suit: 3 }, // Qc
    Card { rank: 3, suit: 2 },  // 5c
    Card { rank: 3, suit: 0 },  // 5s
    Card { rank: 3, suit: 1 },  // 5h
    Card { rank: 0, suit: 0 },  // filler low card
    Card { rank: 1, suit: 0 },  // filler
  ]);
  let opp_score = best_of(&[
    Card { rank: 6, suit: 2 },  // 8d
    Card { rank: 10, suit: 3 }, // Qc
    Card { rank: 3, suit: 2 },  // 5c
    Card { rank: 10, suit: 0 }, // Qs
    Card { rank: 10, suit: 1 }, // Qh
    Card { rank: 0, suit: 0 },
    Card { rank: 1, suit: 0 },
  ]);
  println!("hero score: {:?}, opp score: {:?}", hero_score, opp_score);
  assert!(
    hero_score.encoded < opp_score.encoded,
    "Hero should be behind QQ on this flop"
  );

  let res = simulate_vs_list_with_ranks(
    "5s 5h",
    "8d Qc 5c",
    "Kc Ks; Qs Qh; Qs Jh; 9c 9h; 5d 8h",
    10000,
    42,
  )
  .expect("simulation ok");
  let mut qq = None;
  let mut hero = None;
  for (c1, c2, w, t, p, _) in &res {
    if *c1 == u32::MAX && *c2 == u32::MAX {
      hero = Some((*w, *t, *p));
    } else {
      let h1 = decode_card(*c1);
      let h2 = decode_card(*c2);
      if (h1 == "Qs" && h2 == "Qh") || (h1 == "Qh" && h2 == "Qs") {
        qq = Some((*w, *t, *p));
      }
      println!("{h1} {h2}: wins {w} ties {t} plays {p}");
    }
  }
  println!("hero aggregated wins/ties/plays: {:?}", hero);
  println!("QQ wins/ties/plays: {:?}", qq);
  assert!(qq.is_some());
  let (w, t, p) = qq.unwrap();
  let hero_win_rate_vs_qq = (p.saturating_sub(w).saturating_sub(t)) as f64 / p as f64;
  assert!(hero_win_rate_vs_qq < 0.5, "hero should not beat QQ");
}
