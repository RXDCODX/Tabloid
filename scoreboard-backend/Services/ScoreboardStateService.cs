using scoreboard_backend.Models;

namespace scoreboard_backend.Services
{
    public class ScoreboardStateService
    {
        private readonly ScoreboardState _state = new();

        public ScoreboardState GetState() => _state;

        public void UpdatePlayer1(Player player)
        {
            _state.Player1 = player;
        }

        public void UpdatePlayer2(Player player)
        {
            _state.Player2 = player;
        }

        public void UpdateMeta(MetaInfo meta)
        {
            _state.Meta = meta;
        }

        public void SetState(ScoreboardState state)
        {
            _state.Player1 = state.Player1;
            _state.Player2 = state.Player2;
            _state.Meta = state.Meta;
        }
    }
}
