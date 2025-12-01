#pragma once
#include "../evaluation/psqt.h"
#include <vector>
#include <cstdint>
#include <algorithm>

namespace ASTROVE::table{
    using ASTROVE::eval::EvalScore;
    
    struct Pawnentry{
        uint64_t key;
        EvalScore score;
    };

    class PawnTable{
    public:
        PawnTable() = default;
        //now func for resize the table
        void resize(size_t mb){
            size_t count=(mb*1024*1024)/sizeof(Pawnentry);
            tabledata.resize(count,{0,EvalScore(0)});
            entrycount=count;
        }

        //return pointer to score if found if not then nullpt
        EvalScore* probe(uint64_t key){
            if(entrycount==0) return nullptr;

            //map key to index
            size_t idx=key%entrycount;
            if(tabledata[idx].key==key){
                return &tabledata[idx].score;
            }
            return nullptr;
        }

        //now func for save scores
        void store(uint64_t key,EvalScore score){
            if(entrycount==0) return;
            size_t idx=key%entrycount;
            //also we allow to replace
            tabledata[idx]={key,score};
        }

        //func for clear thre table
        void clear(){
            if(entrycount>0){
                std::fill(tabledata.begin(), tabledata.end(), Pawnentry{0, EvalScore(0)});
            }
        }

    private:
        std::vector<Pawnentry> tabledata; 
        size_t entrycount=0;
    };

    //global instance
    extern PawnTable pawnhashtable;
}
