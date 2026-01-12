use rand::{SeedableRng, rngs::StdRng};
use rs_poker::arena::{
  AgentGenerator,
  CloneGameStateGenerator,
  HoldemSimulationBuilder,
  action::{Action, AgentAction, ForcedBetType},
  agent::{
    CallingAgent,
    CallingAgentGenerator,
    FoldingAgentGenerator,
    RandomAgent,
    RandomAgentGenerator,
  },
  competition::{HoldemCompetition, StandardSimulationIterator},
  game_state::{GameState, Round},
  historian::FnHistorian,
};
use rs_poker::core::Card;
use std::{cell::RefCell, rc::Rc};

pub fn run() {
  println!("\n-- arena: エージェント対戦/大会シミュレーション --");

  run_full_street_demo();

  let stacks = vec![100.0, 100.0];
  let agents: Vec<Box<dyn rs_poker::arena::Agent>> = vec![
    Box::<CallingAgent>::default(),
    Box::<RandomAgent>::default(),
  ];
  let mut rng = StdRng::seed_from_u64(42);
  let game_state = GameState::new_starting(stacks, 10.0, 5.0, 0.0, 0);
  let mut sim = HoldemSimulationBuilder::default()
    .game_state(game_state)
    .agents(agents)
    .build()
    .unwrap();

  sim.run(&mut rng);
  println!("単発シミュレーション -> 最終スタック={:?}", sim.game_state.stacks);
  println!(
    "単発シミュレーション -> 終了ラウンド={}",
    sim.game_state.round_before
  );

  let agent_gens: Vec<Box<dyn AgentGenerator>> = vec![
    Box::<CallingAgentGenerator>::default(),
    Box::<FoldingAgentGenerator>::default(),
    Box::<RandomAgentGenerator>::default(),
  ];
  let game_state = GameState::new_starting(vec![100.0; 3], 10.0, 5.0, 0.0, 0);
  let sim_gen = StandardSimulationIterator::new(
    agent_gens,
    vec![],
    CloneGameStateGenerator::new(game_state),
  );
  let mut competition = HoldemCompetition::new(sim_gen);
  let _ = competition.run(20).unwrap();

  let change_summary = &competition.total_change[..3];
  println!("大会シミュレーション(20回) -> 合計BB変化={change_summary:?}");
  println!(
    "大会シミュレーション -> 勝ち回数={:?}",
    &competition.win_count[..3]
  );
}

fn run_full_street_demo() {
  println!("\n-- arena: フルストリート 1ハンド (9プレイヤー) --");

  let num_players = 9;
  let player_labels = build_player_labels(num_players);
  let stacks = vec![100.0; num_players];
  let agents: Vec<Box<dyn rs_poker::arena::Agent>> = (0..num_players)
    .map(|_| Box::<CallingAgent>::default() as Box<dyn rs_poker::arena::Agent>)
    .collect();
  let mut rng = StdRng::seed_from_u64(777);
  let game_state = GameState::new_starting(stacks, 10.0, 5.0, 0.0, 0);

  let hands: Rc<RefCell<Vec<Vec<Card>>>> =
    Rc::new(RefCell::new(vec![Vec::new(); num_players]));
  let round_actions: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));
  let last_round: Rc<RefCell<Option<Round>>> = Rc::new(RefCell::new(None));

  let hands_ref = hands.clone();
  let round_ref = last_round.clone();
  let last_round_ref = last_round.clone();
  let actions_ref = round_actions.clone();
  let labels_ref = player_labels.clone();
  let historian = Box::new(FnHistorian::new(move |_id, game_state, action| {
    match action {
      Action::GameStart(payload) => {
        println!(
          "GameStart: ante={:.1} sb={:.1} bb={:.1}",
          payload.ante, payload.small_blind, payload.big_blind
        );
      }
      Action::PlayerSit(payload) => {
        let label = &labels_ref[payload.idx];
        println!("PlayerSit: {label} stack={:.1}", payload.player_stack);
      }
      Action::DealStartingHand(payload) => {
        let mut all_hands = hands_ref.borrow_mut();
        let entry = all_hands.get_mut(payload.idx);
        if let Some(cards) = entry {
          cards.push(payload.card);
          if cards.len() == 2 {
            let label = &labels_ref[payload.idx];
            let hand_text = format_cards(cards);
            println!("DealHand: {label} hand={hand_text}");
          }
        }
      }
      Action::ForcedBet(payload) => {
        let label = match payload.forced_bet_type {
          ForcedBetType::Ante => "Ante",
          ForcedBetType::SmallBlind => "SmallBlind",
          ForcedBetType::BigBlind => "BigBlind",
        };
        let player = &labels_ref[payload.idx];
        println!(
          "ForcedBet: {player} type={label} bet={:.1} stack={:.1}",
          payload.bet, payload.player_stack
        );
      }
      Action::PlayedAction(payload) => {
        let player = &labels_ref[payload.idx];
        let action_text = format_action(&payload.action);
        actions_ref.borrow_mut().push(format!(
          "{player}: {action_text} (stack={:.1}, pot={:.1})",
          payload.player_stack, payload.final_pot
        ));
      }
      Action::DealCommunity(card) => {
        let board = format_cards(&game_state.board);
        println!("DealCommunity: {card} -> board={board}");
      }
      Action::RoundAdvance(round) => {
        let mut prev = round_ref.borrow_mut();
        if prev.as_ref() != Some(&round) {
          flush_round_actions(prev.as_ref(), &actions_ref);
          let board = format_cards(&game_state.board);
          println!(
            "RoundAdvance: {round} pot={:.1} board={board}",
            game_state.total_pot
          );
          *prev = Some(round);
        }
      }
      Action::Award(payload) => {
        flush_round_actions(last_round_ref.borrow().as_ref(), &actions_ref);
        let rank = payload
          .rank
          .map(|r| format!("{r:?}"))
          .unwrap_or_else(|| "-".to_string());
        let hand = payload
          .hand
          .map(|h| format_cards(&h.iter().collect::<Vec<_>>()))
          .unwrap_or_else(|| "-".to_string());
        let player = &labels_ref[payload.idx];
        println!(
          "Award: {player} amount={:.1} pot={:.1} rank={rank} hand={hand}",
          payload.award_amount, payload.total_pot
        );
      }
      Action::FailedAction(payload) => {
        let action_text = format_action(&payload.action);
        let player = &labels_ref[payload.result.idx];
        println!("FailedAction: {player} action={action_text}");
      }
    }
    Ok(())
  }));

  let mut sim = HoldemSimulationBuilder::default()
    .game_state(game_state)
    .agents(agents)
    .historians(vec![historian])
    .build()
    .unwrap();

  sim.run(&mut rng);
  flush_round_actions(last_round.borrow().as_ref(), &round_actions);
  println!("FullStreet -> 最終スタック={:?}", sim.game_state.stacks);
  println!(
    "FullStreet -> 終了ラウンド={}",
    sim.game_state.round_before
  );
}

fn format_cards(cards: &[Card]) -> String {
  if cards.is_empty() {
    return "-".to_string();
  }
  cards
    .iter()
    .map(|card| card.to_string())
    .collect::<Vec<_>>()
    .join(" ")
}

fn format_action(action: &AgentAction) -> String {
  match action {
    AgentAction::Fold => "Fold".to_string(),
    AgentAction::Call => "Call".to_string(),
    AgentAction::Bet(amount) => format!("Bet {:.1}", amount),
    AgentAction::AllIn => "AllIn".to_string(),
  }
}

fn build_player_labels(num_players: usize) -> Vec<String> {
  (0..num_players)
    .map(|idx| if idx == 0 { "Hero".to_string() } else { format!("P{idx}") })
    .collect()
}

fn flush_round_actions(
  round: Option<&Round>,
  actions: &Rc<RefCell<Vec<String>>>,
) {
  let mut entries = actions.borrow_mut();
  if entries.is_empty() {
    return;
  }
  if let Some(round) = round {
    println!("-- {round} actions --");
  } else {
    println!("-- actions --");
  }
  for entry in entries.iter() {
    println!("  {entry}");
  }
  entries.clear();
}
