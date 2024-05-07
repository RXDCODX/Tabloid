using Main.Domains;

namespace Main.Services;

public class Methods
{
    private static MainModel MainModel => DataHost.Data;

    public void Reset()
    {
        DataHost.Data = new MainModel();
    }

    public void SwitchPlayers()
    {
        (MainModel.GameInfo.Player1, MainModel.GameInfo.Player2) = (MainModel.GameInfo.Player2, MainModel.GameInfo.Player1);
    }

    public void SwitchPlayerNames()
    {
        (MainModel.GameInfo.Player1.Name, MainModel.GameInfo.Player2.Name) = (MainModel.GameInfo.Player2.Name, MainModel.GameInfo.Player1.Name);
        (MainModel.GameInfo.Player1.Tag, MainModel.GameInfo.Player2.Tag) = (MainModel.GameInfo.Player2.Tag, MainModel.GameInfo.Player1.Tag);
    }

    public void SwitchPlayerCountryes()
    {
        (MainModel.GameInfo.Player1.Country, MainModel.GameInfo.Player2.Country) = (MainModel.GameInfo.Player2.Country, MainModel.GameInfo.Player1.Country);
    }

    public void ClearPlayers()
    {
        MainModel.GameInfo.Player1 = new Player();
        MainModel.GameInfo.Player2 = new Player();
    }
}