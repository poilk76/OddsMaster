import pytest
from core import arbitrage

class TestCalculateArbitrage:

    @pytest.mark.parametrize(
        "odds,tax,expected",
        [
            ((2.20, 2.10), 0, True),
            ((2.20, 2.10), 5, True),
            ((2.20, 2.10), 8, False),
            ((3.60, 4.10, 2.50), 0, True),
            ((3.60, 4.10, 2.50), 5, True),
            ((2.00, 2.00), 0, False),
            ((2.50, 1.80), 0, True),
            ((10.00, 10.00, 10.00), 10, True),
            ((1.90, 1.90), 0, False),
            ((5.00, 5.00, 5.00), 20, True),
        ],
    )
    def test_basic_calculations(self,odds,tax,expected):

        test = arbitrage.calculate_arbitrage(odds,tax) > 0

        assert test == expected

    def test_empty_odds(self):

        assert arbitrage.calculate_arbitrage(()) == 0.0

    def test_wrong_types(self):

        assert arbitrage.calculate_arbitrage("","21") == 0.0
class TestStakeCalculation:

    @pytest.mark.parametrize(
        "odds,expected",
        [
            ((2.20, 2.10), (48.8,51.2)),
            ((2.20, 2.10), (48.8,51.2)),
            ((2.20, 2.10), (48.8,51.2)),
            ((3.60, 4.10, 2.50), (30.1,26.5,43.4)),
            ((3.60, 4.10, 2.50), (30.1,26.5,43.4)),
            ((2.00, 2.00), (50.0,50.0)),
            ((2.50, 1.80), (41.9,58.1)),
            ((10.00, 10.00, 10.00), (33.3,33.3,33.3)),
            ((1.90, 1.90), (50.0,50.0)),
            ((5.00, 5.00, 5.00),(33.3,33.3,33.3)),
        ],
    )
    def test_basic_calculations(self,odds,expected):

        assert arbitrage.calculate_stakes(odds) == expected

    def test_empty_input(self):

        assert arbitrage.calculate_stakes(()) == ()

    def test_wrong_type_odds(self):

        assert arbitrage.calculate_stakes("") == ()

    def test_wrong_type_stake(self):
    
            assert arbitrage.calculate_stakes((1.2,2.3),"321") == ()