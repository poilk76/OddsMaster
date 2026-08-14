import pytest

from collector.core.ev import calculate_ev, calculate_kelly_criterion
from collector.models.match import Match

class TestEvCalculations:

    @pytest.mark.parametrize(
        "odds, tax, expected",
        [
            ({
                "test1":(1.6,4.25,5.2),
                "test2":(1.55,4.25,5.23)
            }, 0, (0.0159,0.,0.0029)),
            ({
                "test1":(4.75,3.9,1.68)
            },12,(-9.4737,-8.9231,-4.8571)),
            ({
                "test1":(2.07,3.3,3.1),
                "test2":(2.1,3.32,3.1),
                "test3":(2.08,3.3,3.07)
            },12,(-6.328,-8.4153,-8.1521)),
            ({
                "test1":(1.28,5.2,9.3)
            },0,(0.,0.,0.)),
            ({
                "test1":(1.6,5.2,9.3),
                "test2":(1.7,5.4,9.3)
            },8,(-3.3636,-6.6226,-7.1398)),
            ({
                "test1":(3.2,3.4,2.09)
            },2,(-1.375,-1.4118,-1.0431)),
            ({
                "test1":(1.22,5.5,9),
                "test2":(1.3,5.,9.1)
            },6,(-1.3968,-5.0952,-5.3646)),
            ({
                "test1":(2.,3.)
            },0,(0.,0.)),
            ({
                "test1":(1.43,2.59),
                "test2":(1.6,3.1)
            },0,(0.0561,0.0896)),
            ({
                "test1":(1.46,2.52)
            },0,(-0.,0.))
        ]
    )
    def test_some_ev_cases(self,odds:dict,tax:int,expected:float):

        m = Match(odds=odds,
                  id=None,teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)

        assert calculate_ev(m,tax) == expected

    @pytest.mark.parametrize(
        "odds, tax",
        [
            ("",12),
            ({},12),
            ({
                "test1":(1.,1.)
            },"12")
        ]
    )
    def test_wrong_input(self,odds:dict,tax:int):

        m = Match(odds=odds,
                id=None,teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)
        
        assert calculate_ev(m,tax) == ()

    def test_zero_divition(self):

        m = Match(odds={"test1":(0.,0.,1.)},
                        id=None,teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)
                
        assert calculate_ev(m,0) == (-1.,-1.,0)


class TestKellyCalculations:

    @pytest.mark.parametrize(
        "odds, tax, expected",
        [
            ({
                "test1":(1.6,4.25,5.2),
                "test2":(1.55,4.25,5.23)
            }, 0, (0.0317,-0.7093,-0.7716)),
            ({
                "test1":(4.75,3.9,1.68)
            },12,(-0.7452,-0.6778,-0.0505)),
            ({
                "test1":(2.07,3.3,3.1),
                "test2":(2.1,3.32,3.1),
                "test3":(2.08,3.3,3.07)
            },12,(-0.2914,-0.6065,-0.572)),
            ({
                "test1":(1.28,5.2,9.3)
            },0,(0.3916,-0.7707,-0.8809)),
            ({
                "test1":(1.6,5.2,9.3),
                "test2":(1.7,5.4,9.3)
            },8,(-0.0374,-0.7764,-0.8809)),
            ({
                "test1":(3.2,3.4,2.09)
            },2,(-0.5898,-0.6194,-0.2926)),
            ({
                "test1":(1.22,5.5,9),
                "test2":(1.3,5.,9.1)
            },6,(0.4042,-0.7749,-0.8774)),
            ({
                "test1":(2.,3.)
            },0,(-0.25,-0.5556)),
            ({
                "test1":(1.43,2.59),
                "test2":(1.6,3.1)
            },0,(0.0726,-0.5351)),
            ({
                "test1":(1.46,2.52)
            },0,(0.1541,-0.4457))
        ]
    )
    def test_some_kelly_cases(self,odds:dict,tax:int,expected:float):

        m = Match(odds=odds,
                  id=None, teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)
        
        assert calculate_kelly_criterion(m,tax) == expected

    @pytest.mark.parametrize(
        "odds, tax",
        [
            ("",12),
            ({},12),
            ({
                "test1":(1.,1.)
            },"12")
        ]
    )
    def test_wrong_input(self,odds:dict,tax:int):

        m = Match(odds=odds,
                id=None,teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)
        
        assert calculate_ev(m,tax) == ()

    def test_zero_divition(self):
    
            m = Match(odds={"test1":(0.,0.,1.)},
                            id=None,teams=None,category=None,start=None,history=None,links=None,ev=None,arb=None)
                    
            assert calculate_ev(m,0) == (-1.,-1.,0)