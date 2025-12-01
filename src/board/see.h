#pragma once
#include "position.h"
#include "../core/move.h"
#include "../core/types.h"

namespace ASTROVE{

class SEE{
public:
    //fun for cal of static exchange evaluation
    static int calculate(const Position& pos,Move move);

    //fun for check if see score is > threshold
    static bool isgood(const Position& pos,Move move,int threshold);

private:
    //now see values
    static constexpr int VALUES[6]={100,325,335,500,975,20000};

    //helpersw
    static Bitboard get_least_valuable_piece(const Position& pos,Bitboard attadef,Color color,PieceType& pieceType);
    static Bitboard get_all_attackers(const Position& pos,Square sq,Bitboard occupied);
};
}