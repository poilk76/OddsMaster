import pytest
from core import normalizer

class TestRemovePrefixesAndSuffixes:

    @pytest.mark.parametrize(
        "text, expected",
        [
            ("SC Freiburg", "freiburg"),
            ("AC Milan", "milan"),
            ("CF CD Leganes", "leganes"),
            ("CF Monterrey", "monterrey"),
            ("Newcastle United", "newcastle"),
            ("Sporting CP", "sporting"),
            ("Real Madrid CF", "real madrid"),
        ],
    )
    def test_common_club_prefixes(self,text,expected):

        assert normalizer.remove_prefixes_and_suffixes(text) == expected

    def test_empty_string(self):
    
        assert normalizer.remove_prefixes_and_suffixes("") == ""

    def test_only_prefixes(self):

        assert normalizer.remove_prefixes_and_suffixes("FC") == ""


class TestUnwantedPunctuactionAndNumbers:

    @pytest.mark.parametrize(
            "text, expected",
            [
                ("2 .Newcastle, United 90", "Newcastle"),
                ("1. Sporting CP.", "Sporting"),
                (" 102, Real? Madrid CF", "Real Madrid"),
            ],
        )
    def test_common_club_suffixes(self,text,expected):
        pass