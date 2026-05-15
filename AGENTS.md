<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# 前提知識

Next.js + TypeScript と Rust + WASMを使用して開発することを前提としています。両方の言語の基本的な文法や構文、そしてNext.jsのプロジェクト構成やAPIルートの作成方法などを理解していることが望ましいです。

## Next.js側

- package管理とjsのランタイムは必ずbunを使用してください。
- .envファイルを変更しないでください。
- src配下にある各ディレクトリにある`readme.md`を参照してファイル分割の責務を理解してください。

- 共通で使用するUIのComponentは`src/components`に保存し、storybookを定義してください。
- アプリの機能に関数ロジックを含むComponentは`src/features` に保存し、storybookを定義してください。
- ライブラリを使用する際は`src/libs`にWrapperを定義して使用してください。
- WASMは`src/libs` にサービス層を定義して呼び出すようにしてください。
- 1file 1componentの原則を守ってください。
- 責務分割とmodule化の考え方を常に意識してください。

## Rust側

- ポーカーのゲームに関する処理はすべてRustで記述するものとします。
- 主に以下のライブラリを使用しますので、公式のドキュメントとGitHubのソースコードをよく読み込んでください。
  - https://docs.rs/rs_poker/latest/rs_poker/index.html
  - https://github.com/elliottneilclark/rs-poker
- RustをWASMにする際のベストプラクティスを用いて開発してください。
- パフォーマンスの高速化を第一優先にしつつ、ファイルや関数の責務分割・可読性・認知負荷の軽減に心がけてください。第三者にとって理解が難しいと思われる箇所は日本語のコメントアウトで補足をするように心がけてください。
- WASMに関する変更をした後は必ずWASMを再度ビルドするようにしてください。

# 権限 (permission)

このリポジトリ内に閉じた変更であり、セキュリティに危険がないものはすべて事前に許可されています。確認を求める必要はありません。

- 許可不要(そのまま実行してよい):
  - リポジトリ配下のファイルの作成・編集・削除(`.env*` を除く)
  - 読み取り・検索系コマンド(`ls` / `cat` / `grep` / `rg` / `find` / `head` / `tail` など)
  - `bun add` / `bun remove` / `bun install` / `bun run` / `bunx` などパッケージ追加・削除・スクリプト実行全般(dev / build / test / lint / format / storybook / wasm:build など)
  - `cargo` / `wasm-pack` の実行、`rustup target` の追加
  - 一時的な dev サーバや Storybook サーバの起動・停止
  - `git status` / `git diff` / `git log` / `git add` / ローカルブランチ操作などの読み取り・ローカル系コマンド
- 必ず事前に許可確認が必要:
  - コンピューター(ホスト OS)へのアクセスや影響(`brew install` などシステム全体に作用するインストール、ホームディレクトリ外への書き込み、グローバル設定の変更、launchd/cron 等の常駐化)
  - ネットワーク経由で外部に作用する操作(`git push`、`gh pr create` / `gh issue` 系、外部 API への送信、`npm publish` 等の公開操作)
  - 認証情報・シークレットを扱う操作(`.env*` の読み書き、鍵ファイル生成、credential helper 設定)
  - 不可逆操作(`git reset --hard`、`git push --force`、`rm -rf` の広範囲適用、データベースの破壊的変更)
