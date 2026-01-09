use rand::{SeedableRng, rngs::StdRng};
use rs_poker::arena::{
  AgentGenerator,
  CloneGameStateGenerator,
  HoldemSimulationBuilder,
  agent::{
    CallingAgent,
    CallingAgentGenerator,
    FoldingAgentGenerator,
    RandomAgent,
    RandomAgentGenerator,
  },
  competition::{HoldemCompetition, StandardSimulationIterator},
  game_state::GameState,
};

pub fn run() {
  println!("\n-- arena: エージェント対戦/大会シミュレーション --");

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
